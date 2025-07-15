from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import torch
from PIL import Image, ImageDraw, ImageFont
import requests
from transformers import CLIPProcessor, CLIPModel
from io import BytesIO
import numpy as np
from typing import Dict, List, Tuple, Optional
import asyncio
import aiohttp
from urllib.parse import urlparse
import math
import cv2
from sklearn.cluster import DBSCAN # Keep DBSCAN for potential future use or more advanced clustering
import base64
import json # For parsing JSON from LLM
import os # Import the os module to access environment variables
from dotenv import load_dotenv # Import load_dotenv
load_dotenv() # Load environment variables from .env file

app = FastAPI(title="Advanced Beach Cleanliness Analyzer", version="3.0")

# Load models
# Using a smaller, faster model for demonstration. For higher accuracy, consider larger CLIP models.
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

class AnalyzeRequest(BaseModel):
    image_url: str
    return_annotated_image: bool = True

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class ObjectDetection(BaseModel):
    category: str
    confidence: float
    severity: int  # 1-10 scale
    description: str
    bounding_box: Optional[BoundingBox] = None

class AnalysisResponse(BaseModel):
    cleanliness_score: float
    category: str
    overall_confidence: float
    detected_objects: List[ObjectDetection]
    beach_characteristics: Dict
    detailed_analysis: Dict
    recommendations: str # This will now come from LLM
    annotated_image_base64: Optional[str] = None

def validate_image_url(url: str) -> bool:
    """Validate if the URL is properly formatted"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

async def download_image(url: str) -> Image.Image:
    """Download image asynchronously with better error handling"""
    if not validate_image_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Failed to download image: HTTP {response.status}")
                
                content = await response.read()
                image = Image.open(BytesIO(content)).convert("RGB")
                
                # Validate image size
                width, height = image.size
                if width < 100 or height < 100:
                    raise HTTPException(status_code=400, detail="Image too small for analysis")
                if width > 4000 or height > 4000:
                    # Resize large images to prevent memory issues and improve processing speed
                    image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
                
                return image
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image content or format: {str(e)}")

def analyze_beach_characteristics(image: Image.Image) -> Dict:
    """Analyze beach size, type, and natural characteristics using CLIP."""
    
    beach_characteristics_prompts = [
        "a wide expansive sandy beach",
        "a narrow beach strip with rocks",
        "a small beach cove",
        "a rocky coastline with pebbles",
        "a sandy beach with fine, white sand",
        "a beach with natural driftwood",
        "a beach with natural seaweed and kelp",
        "a beach with large natural rocks and stones",
        "a beach with cliffs and natural formations",
        "a beach with lush coastal vegetation and plants"
    ]
    
    inputs = processor(
        text=beach_characteristics_prompts,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0] # Probabilities for each prompt

    # Determine beach size based on probabilities of relevant prompts
    # Example: weight "wide expansive" higher, "narrow" medium, "small" lower
    size_score = (probs[0] * 3 + probs[1] * 2 + probs[2] * 1).item()
    
    # Extract scores for natural elements
    natural_elements = {
        "driftwood": float(probs[5]),
        "seaweed": float(probs[6]),
        "rocks_stones": float(probs[7]),
        "natural_formations": float(probs[8]),
        "vegetation": float(probs[9])
    }
    
    # Determine beach type
    beach_type = "sandy" if probs[4] > probs[3] else "rocky" if probs[3] > probs[4] else "mixed"
    
    return {
        "estimated_size": "large" if size_score > 2.5 else "medium" if size_score > 1.5 else "small",
        "size_factor": float(size_score),
        "natural_elements": natural_elements,
        "beach_type": beach_type
    }

def generate_attention_map(image: Image.Image, text_prompt: str) -> np.ndarray:
    """
    Generate an approximate spatial attention map using CLIP's patch embeddings.
    This is a heuristic for localization as CLIP is not a direct object detection model.
    """
    # Process image and text with CLIP processor
    inputs = processor(text=[text_prompt], images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        # Get the vision model output, specifically interested in the last hidden state for patches
        # This requires accessing the internal structure of the CLIP model's vision transformer
        # The output of vision_model usually contains `last_hidden_state` which includes patch embeddings
        vision_output = model.vision_model(inputs['pixel_values'])
        
        # The last_hidden_state is typically (batch_size, sequence_length, hidden_size)
        # sequence_length is (num_patches + 1) for [CLS] token + patches
        patch_embeddings = vision_output.last_hidden_state[:, 1:, :] # Exclude [CLS] token (1, num_patches, 768)

        # Get text features
        text_features = model.get_text_features(inputs['input_ids']) # (1, 512)

        # Project patch embeddings to the same dimension as text features (512 for CLIP-ViT-B/32)
        # model.visual_projection is a nn.Linear(768, 512) for this model.
        # It expects input of shape (..., in_features) and applies to the last dimension.
        # So, (1, num_patches, 768) -> (1, num_patches, 512)
        if model.visual_projection is not None:
            projected_patch_embeddings = model.visual_projection(patch_embeddings)
        else:
            # Fallback if visual_projection is not directly accessible or applicable.
            # This indicates a potential issue with the model loading or architecture.
            raise RuntimeError("CLIP model does not have a visual_projection layer for patch embeddings. Cannot align dimensions for attention map.")
            
        # Now both `projected_patch_embeddings` (1, num_patches, 512) and `text_features` (1, 512)
        # are in the same embedding space (512-dim).

        # Calculate cosine similarity between each patch embedding and the text feature
        # similarity_per_patch: (1, num_patches)
        similarity_per_patch = torch.cosine_similarity(
            projected_patch_embeddings, # (1, num_patches, 512)
            text_features.unsqueeze(1), # (1, 1, 512) - unsqueeze for broadcasting
            dim=-1 # Compare along the last dimension (embedding dimension)
        )

        # Normalize similarity scores to be between 0 and 1
        similarity_per_patch = (similarity_per_patch - similarity_per_patch.min()) / (similarity_per_patch.max() - similarity_per_patch.min() + 1e-8)

        # Reshape to a grid (e.g., 7x7 for ViT-B/32, as 224/32 = 7)
        grid_size = int(patch_embeddings.shape[1]**0.5)
        if grid_size * grid_size != patch_embeddings.shape[1]:
            # This fallback should ideally not be hit with standard CLIP image sizes
            print(f"Warning: Patch count {patch_embeddings.shape[1]} is not a perfect square. Using a simpler attention map.")
            # If not a perfect square, we can't reshape to 2D grid directly.
            # A simple fallback is to just return a 1D map that will be interpolated.
            # This might result in less precise bounding boxes.
            attention_map_grid = similarity_per_patch.view(1, 1, -1, 1) # Reshape to (N, C, H, W) where W=1
        else:
            attention_map_grid = similarity_per_patch.view(1, 1, grid_size, grid_size) # (1, 1, 7, 7) for 224x224 input

        # Interpolate to original image size
        attention_map = torch.nn.functional.interpolate(
            attention_map_grid,
            size=(image.height, image.width),
            mode='bilinear',
            align_corners=False
        ).squeeze().detach().numpy()
    
    return attention_map


def non_max_suppression(boxes: List[Tuple[int, int, int, int]], scores: List[float], iou_threshold: float = 0.5) -> List[Tuple[int, int, int, int]]:
    """Applies Non-Maximum Suppression to a list of bounding boxes."""
    if not boxes:
        return []

    # Convert to numpy arrays
    boxes_np = np.array(boxes)
    scores_np = np.array(scores)

    # Get coordinates of bounding boxes
    x1 = boxes_np[:, 0]
    y1 = boxes_np[:, 1]
    x2 = boxes_np[:, 0] + boxes_np[:, 2]
    y2 = boxes_np[:, 1] + boxes_np[:, 3]

    # Compute area of bounding boxes
    areas = (x2 - x1) * (y2 - y1)

    # Sort by confidence scores in descending order
    order = scores_np.argsort()[::-1]

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)

        # Compute intersection coordinates
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        # Compute intersection area
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h

        # Compute Union
        ovr = inter / (areas[i] + areas[order[1:]] - inter)

        # Get all indexes where IoU is less than the threshold
        inds = np.where(ovr <= iou_threshold)[0]
        order = order[inds + 1] # +1 because we removed the first element

    return [boxes[idx] for idx in keep]


def find_object_regions(attention_map: np.ndarray, threshold: float = 0.3, min_size: int = 20, iou_threshold: float = 0.5) -> List[Tuple[int, int, int, int]]:
    """
    Find bounding boxes for detected objects using attention maps and apply NMS.
    """
    # Normalize attention map to 0-255
    attention_map = (attention_map - attention_map.min()) / (attention_map.max() - attention_map.min() + 1e-8) * 255
    attention_map = attention_map.astype(np.uint8)
    
    # Apply threshold to create a binary map
    _, binary_map = cv2.threshold(attention_map, int(threshold * 255), 255, cv2.THRESH_BINARY)
    
    # Find contours
    contours, _ = cv2.findContours(binary_map, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    candidate_boxes = []
    candidate_scores = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter out very small regions
        if w > min_size and h > min_size:
            # Calculate a "score" for the box based on the average attention within it
            # This is a simple score; more complex scoring could be used.
            region_attention = attention_map[y:y+h, x:x+w]
            score = np.mean(region_attention) / 255.0 # Normalize to 0-1
            
            candidate_boxes.append((x, y, w, h))
            candidate_scores.append(score)
    
    # Apply Non-Maximum Suppression
    # NMS requires boxes in (x1, y1, x2, y2) format. Convert and then convert back.
    boxes_to_process = np.array([(x, y, x + w, y + h) for x, y, w, h in candidate_boxes])
    scores_to_process = np.array(candidate_scores)

    # Sort by score
    indices = np.argsort(scores_to_process)[::-1]

    keep_indices = []
    while indices.size > 0:
        i = indices[0]
        keep_indices.append(i)

        if indices.size == 1:
            break

        current_box = boxes_to_process[i]
        other_boxes = boxes_to_process[indices[1:]]

        # Calculate IoU
        x1 = np.maximum(current_box[0], other_boxes[:, 0])
        y1 = np.maximum(current_box[1], other_boxes[:, 1])
        x2 = np.minimum(current_box[2], other_boxes[:, 2])
        y2 = np.minimum(current_box[3], other_boxes[:, 3])

        intersection_area = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)
        
        box_area = (current_box[2] - current_box[0]) * (current_box[3] - current_box[1])
        other_areas = (other_boxes[:, 2] - other_boxes[:, 0]) * (other_boxes[:, 3] - other_boxes[:, 1])
        
        union_area = box_area + other_areas - intersection_area
        iou = intersection_area / (union_area + 1e-8)

        # Filter out boxes with high IoU
        indices = indices[1:][iou <= iou_threshold]
    
    final_boxes = []
    for idx in keep_indices:
        x1, y1, x2, y2 = boxes_to_process[idx]
        final_boxes.append((int(x1), int(y1), int(x2 - x1), int(y2 - y1))) # Convert back to (x, y, w, h)
        
    return final_boxes


def detect_trash_objects_with_location(image: Image.Image) -> List[Dict]:
    """Detect and classify trash objects with bounding box locations using CLIP and NMS."""
    
    # Detailed trash classification with severity levels and colors
    trash_categories = {
        "plastic_bottles": {
            "prompts": ["plastic water bottles", "discarded plastic soda bottles", "empty plastic containers"],
            "severity": 6,
            "description": "Plastic bottles",
            "color": "#FF4444"  # Red
        },
        "plastic_bags": {
            "prompts": ["plastic shopping bags", "plastic debris bags", "film plastic"],
            "severity": 7,
            "description": "Plastic bags",
            "color": "#FF6B6B"  # Light red
        },
        "cigarette_butts": {
            "prompts": ["cigarette butts", "tobacco waste", "filter tips"],
            "severity": 4,
            "description": "Cigarette butts",
            "color": "#FFA500"  # Orange
        },
        "food_containers": {
            "prompts": ["takeaway food containers", "disposable food packaging", "styrofoam boxes"],
            "severity": 5,
            "description": "Food containers and packaging",
            "color": "#FFD700"  # Gold
        },
        "cans_bottles": {
            "prompts": ["aluminum cans", "glass bottles", "beverage containers"],
            "severity": 5,
            "description": "Cans and glass bottles",
            "color": "#32CD32"  # Lime green
        },
        "fishing_debris": {
            "prompts": ["fishing nets", "fishing lines", "fishing gear", "buoys"],
            "severity": 8,
            "description": "Fishing equipment and nets",
            "color": "#8A2BE2"  # Blue violet
        },
        "large_debris": {
            "prompts": ["large pieces of trash", "furniture", "appliances", "construction waste"],
            "severity": 9,
            "description": "Large debris items",
            "color": "#DC143C"  # Crimson
        },
        "microplastics": {
            "prompts": ["small plastic fragments", "tiny plastic pieces", "microscopic plastic"],
            "severity": 6,
            "description": "Microplastics and fragments",
            "color": "#FF69B4"  # Hot pink
        },
        "paper_cardboard": {
            "prompts": ["paper litter", "cardboard boxes", "newspaper"],
            "severity": 3,
            "description": "Paper and cardboard waste",
            "color": "#87CEEB"  # Sky blue
        },
        "chemical_containers": {
            "prompts": ["chemical containers", "hazardous waste drums", "oil spills"],
            "severity": 10,
            "description": "Chemical or hazardous containers",
            "color": "#B22222"  # Fire brick
        },
        "footwear": {
            "prompts": ["discarded shoes", "flip-flops", "sandals"],
            "severity": 4,
            "description": "Footwear",
            "color": "#A0522D" # Sienna
        },
        "clothing": {
            "prompts": ["discarded clothes", "textile waste", "rags"],
            "severity": 5,
            "description": "Clothing and textiles",
            "color": "#4682B4" # Steel Blue
        }
    }
    
    detected_objects = []
    
    for category, details in trash_categories.items():
        # Test each prompt for this category
        for prompt in details["prompts"]:
            inputs = processor(
                text=[prompt],
                images=[image],
                return_tensors="pt",
                padding=True
            )
            
            with torch.no_grad():
                outputs = model(**inputs)
                similarity = outputs.logits_per_image[0][0]
                confidence = torch.sigmoid(similarity).item() # Convert logit to probability

                # Dynamic thresholding: higher severity items need lower confidence to be detected
                # This helps in detecting critical items even if less prominent.
                base_threshold = 0.15 # Default threshold
                severity_adjustment = (details["severity"] - 5) * 0.01 # Adjust by severity
                effective_threshold = max(0.05, base_threshold - severity_adjustment) # Min threshold of 0.05
                
                if confidence > effective_threshold:
                    try:
                        attention_map = generate_attention_map(image, prompt)
                        # Pass iou_threshold to find_object_regions
                        bounding_boxes = find_object_regions(attention_map, threshold=0.45, min_size=30, iou_threshold=0.5) # Increased min_size
                        
                        if bounding_boxes:
                            for bbox in bounding_boxes:
                                x, y, w, h = bbox
                                detected_objects.append({
                                    "category": category,
                                    "confidence": confidence,
                                    "severity": details["severity"],
                                    "description": details["description"],
                                    "color": details["color"],
                                    "bounding_box": {
                                        "x": int(x),
                                        "y": int(y),
                                        "width": int(w),
                                        "height": int(h)
                                    }
                                })
                        else:
                            # If no specific region found but object detected, add without bounding box
                            detected_objects.append({
                                "category": category,
                                "confidence": confidence,
                                "severity": details["severity"],
                                "description": details["description"],
                                "color": details["color"],
                                "bounding_box": None
                            })
                    except Exception as e:
                        print(f"Error generating attention map or bounding boxes for {prompt}: {e}")
                        # Fallback: object detected but no localization
                        detected_objects.append({
                            "category": category,
                            "confidence": confidence,
                            "severity": details["severity"],
                            "description": details["description"],
                            "color": details["color"],
                            "bounding_box": None
                        })
                        
                    break  # Found object in this category, no need to test other prompts
    
    return detected_objects

def annotate_image_with_detections(image: Image.Image, detected_objects: List[Dict]) -> Image.Image:
    """Annotate image with bounding boxes and labels for detected objects."""
    
    annotated_image = image.copy()
    draw = ImageDraw.Draw(annotated_image)
    
    try:
        font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    for obj in detected_objects:
        if obj["bounding_box"] is not None:
            bbox = obj["bounding_box"]
            x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
            
            color = obj["color"]
            draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
            
            label = f"{obj['description']} ({obj['confidence']:.2f})"
            severity_text = f"Severity: {obj['severity']}/10"

            # Draw label background and text
            if small_font:
                # Use textbbox to get text dimensions
                # textbbox returns (left, top, right, bottom)
                label_bbox = draw.textbbox((x, y), label, font=small_font)
                text_width = label_bbox[2] - label_bbox[0]
                text_height = label_bbox[3] - label_bbox[1]
                
                draw.rectangle([x, y - text_height - 5, x + text_width + 5, y], fill=color)
                draw.text((x + 2, y - text_height - 3), label, fill="white", font=small_font)

                severity_bbox = draw.textbbox((x, y + h + 2), severity_text, font=small_font)
                severity_width = severity_bbox[2] - severity_bbox[0]
                severity_height = severity_bbox[3] - severity_bbox[1]

                draw.rectangle([x, y + h + 2, x + severity_width + 5, y + h + severity_height + 7], fill=color)
                draw.text((x + 2, y + h + 4), severity_text, fill="white", font=small_font)
            else:
                draw.text((x, y - 15), label, fill=color)
                draw.text((x, y + h + 5), severity_text, fill=color)
    
    # Add legend
    legend_y_start = 10
    legend_x_start = 10
    legend_item_height = 25
    
    unique_categories = {}
    for obj in detected_objects:
        unique_categories[obj["category"]] = obj # Use category as key to ensure uniqueness

    if unique_categories:
        legend_height = len(unique_categories) * legend_item_height + 40
        draw.rectangle([legend_x_start, legend_y_start, 300, legend_y_start + legend_height], fill="white", outline="black", width=2)
        
        if font:
            # Use textbbox for legend title
            title_bbox = draw.textbbox((legend_x_start + 5, legend_y_start + 5), "Detected Objects:", font=font)
            draw.text((legend_x_start + 5, legend_y_start + 5), "Detected Objects:", fill="black", font=font)
        else:
            draw.text((legend_x_start + 5, legend_y_start + 5), "Detected Objects:", fill="black")
        
        for i, (category, obj) in enumerate(unique_categories.items()):
            y_pos = legend_y_start + 35 + i * legend_item_height
            draw.rectangle([legend_x_start + 5, y_pos, legend_x_start + 15, y_pos + 10], fill=obj["color"])
            text = f"{obj['description']} (Sev: {obj['severity']})"
            if small_font:
                draw.text((legend_x_start + 20, y_pos), text, fill="black", font=small_font)
            else:
                draw.text((legend_x_start + 20, y_pos), text, fill="black")
    
    return annotated_image

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

def distinguish_natural_vs_artificial(image: Image.Image) -> Dict:
    """Distinguish between natural beach elements and artificial debris using CLIP."""
    
    natural_vs_artificial_prompts = [
        "natural driftwood logs on beach",
        "natural seaweed and kelp",
        "natural rocks and pebbles",
        "natural shells and coral",
        "construction debris and concrete waste",
        "artificial plastic litter",
        "metal and industrial waste",
        "processed wood and lumber scraps",
        "clean beach with natural elements",
        "polluted beach with artificial trash"
    ]
    
    inputs = processor(
        text=natural_vs_artificial_prompts,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]
    
    # Sum probabilities for natural and artificial categories
    natural_score = float(sum(probs[i] for i in [0, 1, 2, 3, 8])) # driftwood, seaweed, rocks, shells, clean beach
    artificial_score = float(sum(probs[i] for i in [4, 5, 6, 7, 9])) # construction, plastic, metal, wood, polluted beach
    
    return {
        "natural_score": natural_score,
        "artificial_score": artificial_score,
        "natural_ratio": natural_score / (natural_score + artificial_score + 1e-8) # Add epsilon to prevent division by zero
    }

def calculate_advanced_cleanliness_score(
    detected_objects: List[Dict],
    beach_characteristics: Dict,
    natural_artificial: Dict
) -> Tuple[float, Dict]:
    """Calculate sophisticated cleanliness score using advanced mathematics."""
    
    base_score = 100.0 # Start with a perfect score
    
    # Adjust base score based on beach size (larger beaches have more tolerance for scattered items)
    size_factors = {"large": 0.9, "medium": 1.0, "small": 1.1} # Multiplier for penalty
    size_penalty_multiplier = size_factors.get(beach_characteristics["estimated_size"], 1.0)
    
    total_impact_penalty = 0
    object_count = len(detected_objects)
    
    if object_count > 0:
        # Calculate weighted severity and total confidence
        total_weighted_severity = sum(obj["severity"] * obj["confidence"] for obj in detected_objects)
        total_confidence = sum(obj["confidence"] for obj in detected_objects)
        
        avg_weighted_severity = total_weighted_severity / object_count
        avg_confidence = total_confidence / object_count

        # Penalty based on density and severity
        # Exponential penalty for high severity items and high density
        density_penalty = 5 * math.log(1 + object_count) # Logarithmic increase with object count
        severity_penalty = avg_weighted_severity * (1 + math.exp((avg_weighted_severity - 7) / 2)) # Exponential for severity > 7

        # Combine penalties, adjusted by confidence and size
        total_impact_penalty = (density_penalty + severity_penalty) * avg_confidence * size_penalty_multiplier
    
    # Bonus for natural elements (reduces penalty)
    # The natural_ratio indicates how much of the scene is natural vs artificial.
    # A higher natural ratio means less penalty from non-natural elements.
    natural_bonus = natural_artificial["natural_ratio"] * 10 # Up to 10 points bonus for very natural beaches
    
    final_score = base_score - total_impact_penalty + natural_bonus
    
    # Ensure score is within 0-100 range
    final_score = max(0, min(100, final_score))
    
    # Detailed analysis for debugging and insights
    analysis = {
        "base_score": base_score,
        "object_count": object_count,
        "total_weighted_severity": total_weighted_severity,
        "avg_weighted_severity": avg_weighted_severity if object_count > 0 else 0,
        "avg_confidence": avg_confidence if object_count > 0 else 0,
        "size_penalty_multiplier": size_penalty_multiplier,
        "density_penalty": density_penalty,
        "severity_penalty": severity_penalty,
        "natural_bonus": natural_bonus,
        "total_impact_penalty": total_impact_penalty
    }
    
    return final_score, analysis

def categorize_cleanliness(score: float) -> str:
    """Categorize cleanliness level with refined thresholds."""
    if score >= 95:
        return "Pristine"
    elif score >= 85:
        return "Very Clean"
    elif score >= 70:
        return "Clean"
    elif score >= 55:
        return "Moderately Clean"
    elif score >= 40:
        return "Needs Attention"
    elif score >= 20:
        return "Poor"
    else:
        return "Heavily Polluted"

async def get_recommendations_from_llm(
    cleanliness_score: float,
    category: str,
    detected_objects: List[Dict],
    beach_characteristics: Dict,
    detailed_analysis: Dict
) -> str:
    """
    Generates detailed, actionable recommendations using the Gemini API.
    """
    object_summaries = ", ".join([f"{obj['description']} (Severity: {obj['severity']}/10)" for obj in detected_objects])
    if not object_summaries:
        object_summaries = "No significant artificial debris detected."

    prompt = f"""
    Analyze the following beach cleanliness report and provide specific, actionable recommendations.
    
    Beach Cleanliness Score: {cleanliness_score:.2f}/100
    Category: {category}
    Detected Objects: {object_summaries}
    Beach Characteristics: {beach_characteristics['estimated_size']} beach, type: {beach_characteristics['beach_type']}. Natural elements present: {', '.join([k for k, v in beach_characteristics['natural_elements'].items() if v > 0.5])}.
    Detailed Analysis: {json.dumps(detailed_analysis, indent=2)}

    Based on this data, provide a concise, bullet-point list of 3-5 actionable recommendations for beach restoration, waste management, and conservation efforts. Focus on practical steps.
    """

    chatHistory = []
    chatHistory.append({ "role": "user", "parts": [{ "text": prompt }] })
    payload = { "contents": chatHistory }
    
    # Retrieve API key from environment variable
    apiKey = os.environ.get("GEMINI_API_KEY", "") 
    if not apiKey:
        print("Warning: GEMINI_API_KEY environment variable not set. LLM recommendations will not work.")
        return "Failed to generate recommendations: API key is missing."

    apiUrl = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(apiUrl, headers={'Content-Type': 'application/json'}, data=json.dumps(payload)) as response:
                response.raise_for_status() # Raise an exception for HTTP errors
                result = await response.json()
                
                if result.get("candidates") and len(result["candidates"]) > 0 and \
                   result["candidates"][0].get("content") and \
                   result["candidates"][0]["content"].get("parts") and \
                   len(result["candidates"][0]["content"]["parts"]) > 0:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    print("LLM response structure unexpected:", result)
                    return "No specific recommendations could be generated by AI."
    except aiohttp.ClientError as e:
        print(f"LLM API call failed: {e}")
        return "Failed to generate recommendations due to API error."
    except Exception as e:
        print(f"An unexpected error occurred during LLM call: {e}")
        return "An error occurred while generating recommendations."

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_beach_cleanliness(payload: AnalyzeRequest):
    """
    Advanced beach cleanliness analysis with detailed object detection.
    Returns comprehensive analysis with accurate scoring and AI-generated recommendations.
    """
    try:
        # Download and validate image
        image = await download_image(payload.image_url)
        
        # Analyze beach characteristics
        beach_characteristics = analyze_beach_characteristics(image)
        
        # Detect trash objects with locations
        detected_objects = detect_trash_objects_with_location(image)
        
        # Distinguish natural vs artificial elements
        natural_artificial = distinguish_natural_vs_artificial(image)
        
        # Calculate sophisticated cleanliness score
        score, detailed_analysis = calculate_advanced_cleanliness_score(
            detected_objects, beach_characteristics, natural_artificial
        )
        
        # Generate annotated image if requested
        annotated_image_base64 = None
        if payload.return_annotated_image:
            annotated_image = annotate_image_with_detections(image, detected_objects)
            annotated_image_base64 = image_to_base64(annotated_image)
        
        # Generate response category
        category = categorize_cleanliness(score)

        # Generate recommendations using LLM
        recommendations = await get_recommendations_from_llm(
            score, category, detected_objects, beach_characteristics, detailed_analysis
        )
        
        # Calculate overall confidence (average of detected object confidences, or a default if no objects)
        overall_confidence = np.mean([obj["confidence"] for obj in detected_objects]) if detected_objects else 0.85
        
        return AnalysisResponse(
            cleanliness_score=round(score, 2),
            category=category,
            overall_confidence=round(overall_confidence, 3),
            detected_objects=[
                ObjectDetection(
                    category=obj["category"],
                    confidence=round(obj["confidence"], 3),
                    severity=obj["severity"],
                    description=obj["description"],
                    bounding_box=BoundingBox(**obj["bounding_box"]) if obj["bounding_box"] else None
                ) for obj in detected_objects
            ],
            beach_characteristics=beach_characteristics,
            detailed_analysis=detailed_analysis,
            recommendations=recommendations,
            annotated_image_base64=annotated_image_base64
        )
        
    except HTTPException:
        raise # Re-raise FastAPI HTTPExceptions
    except Exception as e:
        # Catch any other unexpected errors and return a 500
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-image")
async def analyze_image_endpoint(payload: AnalyzeRequest):
    """
    Analyze image and return annotated image as downloadable file.
    This endpoint is separate for direct image download without full analysis response.
    """
    try:
        # Download and validate image
        image = await download_image(payload.image_url)
        
        # Detect trash objects with locations
        detected_objects = detect_trash_objects_with_location(image)
        
        # Generate annotated image
        annotated_image = annotate_image_with_detections(image, detected_objects)
        
        # Convert to bytes for streaming
        img_buffer = BytesIO()
        annotated_image.save(img_buffer, format="JPEG", quality=85)
        img_buffer.seek(0)
        
        return StreamingResponse(
            BytesIO(img_buffer.getvalue()),
            media_type="image/jpeg",
            headers={"Content-Disposition": "attachment; filename=annotated_beach.jpg"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": "CLIP-ViT-B/32", "version": "3.0"}

@app.get("/categories")
async def get_categories():
    """Get information about detection categories and scoring"""
    return {
        "trash_categories": {
            "plastic_bottles": {"severity": 6, "description": "Plastic bottles"},
            "plastic_bags": {"severity": 7, "description": "Plastic bags"},
            "cigarette_butts": {"severity": 4, "description": "Cigarette butts"},
            "food_containers": {"severity": 5, "description": "Food containers"},
            "cans_bottles": {"severity": 5, "description": "Cans and bottles"},
            "fishing_debris": {"severity": 8, "description": "Fishing equipment"},
            "large_debris": {"severity": 9, "description": "Large debris"},
            "microplastics": {"severity": 6, "description": "Microplastics"},
            "paper_cardboard": {"severity": 3, "description": "Paper waste"},
            "chemical_containers": {"severity": 10, "description": "Hazardous containers"},
            "footwear": {"severity": 4, "description": "Footwear"},
            "clothing": {"severity": 5, "description": "Clothing and textiles"}
        },
        "scoring_system": {
            "base_score": 100,
            "natural_elements_bonus": "Up to 10 points for high natural ratio",
            "size_adjustment": "Larger beaches have slightly more tolerance for scattered items",
            "severity_weighting": "Exponential penalty for high-severity items and density",
            "confidence_integration": "Detection confidence influences penalty strength"
        }
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Advanced Beach Cleanliness Analyzer API",
        "version": "3.0",
        "features": [
            "Sophisticated object detection and classification",
            "Natural vs artificial element distinction",
            "Beach size-aware scoring",
            "Exponential severity weighting",
            "Detailed mathematical analysis",
            "AI-generated actionable recommendations"
        ],
        "endpoints": {
            "analyze": "/analyze - POST: Analyze beach cleanliness with optional annotated image",
            "analyze-image": "/analyze-image - POST: Get annotated image as downloadable file",
            "categories": "/categories - GET: Detection categories info",
            "health": "/health - - GET: Health check",
            "docs": "/docs - GET: API documentation"
        },
        "image_annotation": {
            "bounding_boxes": "Color-coded squares around detected objects",
            "legend": "Shows detected categories and severity levels",
            "base64_option": "Set return_annotated_image=true in /analyze",
            "download_option": "Use /analyze-image for direct download"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
