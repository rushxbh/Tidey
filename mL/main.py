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
from sklearn.cluster import DBSCAN
import base64

app = FastAPI(title="Advanced Beach Cleanliness Analyzer", version="3.0")

# Load models
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
    recommendations: str
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
                    image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
                
                return image
    except aiohttp.ClientError:
        raise HTTPException(status_code=400, detail="Failed to download image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

def analyze_beach_characteristics(image: Image.Image) -> Dict:
    """Analyze beach size, type, and natural characteristics"""
    
    # Beach size and type indicators
    beach_characteristics = [
        "wide expansive beach with lots of sand",
        "narrow beach strip",
        "small beach cove",
        "rocky coastline with pebbles",
        "sandy beach with fine sand",
        "beach with natural driftwood",
        "beach with natural seaweed",
        "beach with natural rocks and stones",
        "beach with cliffs and natural formations",
        "beach with vegetation and plants"
    ]
    
    inputs = processor(
        text=beach_characteristics,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]
    
    # Determine beach size (affects scoring baseline)
    size_score = probs[0] * 3 + probs[1] * 2 + probs[2] * 1  # Wide=3, Narrow=2, Small=1
    
    # Natural elements (shouldn't be penalized)
    natural_elements = {
        "driftwood": float(probs[5]),
        "seaweed": float(probs[6]),
        "rocks_stones": float(probs[7]),
        "natural_formations": float(probs[8]),
        "vegetation": float(probs[9])
    }
    
    return {
        "estimated_size": "large" if size_score > 2.5 else "medium" if size_score > 1.5 else "small",
        "size_factor": float(size_score),
        "natural_elements": natural_elements,
        "beach_type": "sandy" if probs[4] > 0.3 else "rocky" if probs[3] > 0.3 else "mixed"
    }

def generate_attention_map(image: Image.Image, text_prompt: str) -> np.ndarray:
    """Generate attention map to localize objects in the image"""
    # Convert PIL to tensor
    image_tensor = torch.tensor(np.array(image)).permute(2, 0, 1).float() / 255.0
    image_tensor = image_tensor.unsqueeze(0)
    
    # Process with CLIP
    inputs = processor(text=[text_prompt], images=[image], return_tensors="pt", padding=True)
    
    # Get attention weights (approximation using gradients)
    image_features = model.get_image_features(inputs['pixel_values'])
    text_features = model.get_text_features(inputs['input_ids'])
    
    # Calculate similarity map
    similarity = torch.cosine_similarity(
        image_features.unsqueeze(-1).unsqueeze(-1),
        text_features.unsqueeze(0).unsqueeze(-1).unsqueeze(-1),
        dim=1
    )
    
    # Resize to original image size
    attention_map = torch.nn.functional.interpolate(
        similarity.unsqueeze(0), 
        size=(image.height, image.width), 
        mode='bilinear', 
        align_corners=False
    ).squeeze().detach().numpy()
    
    return attention_map

def find_object_regions(attention_map: np.ndarray, threshold: float = 0.3) -> List[Tuple[int, int, int, int]]:
    """Find bounding boxes for detected objects using attention maps"""
    # Normalize attention map
    attention_map = (attention_map - attention_map.min()) / (attention_map.max() - attention_map.min())
    
    # Threshold the attention map
    binary_map = (attention_map > threshold).astype(np.uint8) * 255
    
    # Find contours
    contours, _ = cv2.findContours(binary_map, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    bounding_boxes = []
    for contour in contours:
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter out very small regions
        if w > 20 and h > 20:
            bounding_boxes.append((x, y, w, h))
    
    return bounding_boxes

def detect_trash_objects_with_location(image: Image.Image) -> List[Dict]:
    """Detect and classify trash objects with bounding box locations"""
    
    # Detailed trash classification with severity levels
    trash_categories = {
        "plastic_bottles": {
            "prompts": ["plastic water bottles on beach", "plastic soda bottles in sand"],
            "severity": 6,
            "description": "Plastic bottles",
            "color": "#FF4444"  # Red
        },
        "plastic_bags": {
            "prompts": ["plastic shopping bags on beach", "plastic bags blowing in wind"],
            "severity": 7,
            "description": "Plastic bags",
            "color": "#FF6B6B"  # Light red
        },
        "cigarette_butts": {
            "prompts": ["cigarette butts in sand", "cigarette filters on beach"],
            "severity": 4,
            "description": "Cigarette butts",
            "color": "#FFA500"  # Orange
        },
        "food_containers": {
            "prompts": ["takeaway containers on beach", "food packaging waste"],
            "severity": 5,
            "description": "Food containers and packaging",
            "color": "#FFD700"  # Gold
        },
        "cans_bottles": {
            "prompts": ["aluminum cans on beach", "glass bottles in sand"],
            "severity": 5,
            "description": "Cans and glass bottles",
            "color": "#32CD32"  # Lime green
        },
        "fishing_debris": {
            "prompts": ["fishing nets on beach", "fishing lines and hooks"],
            "severity": 8,
            "description": "Fishing equipment and nets",
            "color": "#8A2BE2"  # Blue violet
        },
        "large_debris": {
            "prompts": ["large pieces of trash", "furniture or appliances on beach"],
            "severity": 9,
            "description": "Large debris items",
            "color": "#DC143C"  # Crimson
        },
        "microplastics": {
            "prompts": ["small plastic fragments", "tiny plastic pieces in sand"],
            "severity": 6,
            "description": "Microplastics and fragments",
            "color": "#FF69B4"  # Hot pink
        },
        "paper_cardboard": {
            "prompts": ["paper litter on beach", "cardboard boxes and packaging"],
            "severity": 3,
            "description": "Paper and cardboard waste",
            "color": "#87CEEB"  # Sky blue
        },
        "chemical_containers": {
            "prompts": ["chemical containers on beach", "hazardous waste containers"],
            "severity": 10,
            "description": "Chemical or hazardous containers",
            "color": "#B22222"  # Fire brick
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
                confidence = torch.sigmoid(similarity).item()
                
                # Adjusted threshold based on severity
                threshold = 0.08 if details["severity"] >= 8 else 0.12 if details["severity"] >= 6 else 0.15
                
                if confidence > threshold:
                    # Generate attention map for localization
                    try:
                        attention_map = generate_attention_map(image, prompt)
                        bounding_boxes = find_object_regions(attention_map, threshold=0.4)
                        
                        # If we found regions, use them
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
                            # No specific region found, but object detected
                            detected_objects.append({
                                "category": category,
                                "confidence": confidence,
                                "severity": details["severity"],
                                "description": details["description"],
                                "color": details["color"],
                                "bounding_box": None
                            })
                    except Exception as e:
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
    """Annotate image with bounding boxes and labels for detected objects"""
    
    # Create a copy of the image
    annotated_image = image.copy()
    draw = ImageDraw.Draw(annotated_image)
    
    # Try to load a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        try:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        except:
            font = None
            small_font = None
    
    # Draw bounding boxes and labels
    for obj in detected_objects:
        if obj["bounding_box"] is not None:
            bbox = obj["bounding_box"]
            x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
            
            # Draw bounding box
            color = obj["color"]
            draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
            
            # Draw label background
            label = f"{obj['description']} ({obj['confidence']:.2f})"
            if font:
                bbox_text = draw.textbbox((x, y-25), label, font=small_font)
                draw.rectangle(bbox_text, fill=color, outline=color)
                draw.text((x, y-25), label, fill="white", font=small_font)
            else:
                draw.text((x, y-15), label, fill=color)
            
            # Draw severity indicator
            severity_text = f"Severity: {obj['severity']}/10"
            if font:
                draw.text((x, y + h + 5), severity_text, fill=color, font=small_font)
            else:
                draw.text((x, y + h + 5), severity_text, fill=color)
    
    # Add legend
    legend_y = 10
    legend_categories = {}
    for obj in detected_objects:
        if obj["category"] not in legend_categories:
            legend_categories[obj["category"]] = obj
    
    if legend_categories:
        # Draw legend background
        legend_height = len(legend_categories) * 25 + 40
        draw.rectangle([10, 10, 300, legend_height], fill="white", outline="black", width=2)
        
        if font:
            draw.text((15, 15), "Detected Objects:", fill="black", font=font)
        else:
            draw.text((15, 15), "Detected Objects:", fill="black")
        
        for i, (category, obj) in enumerate(legend_categories.items()):
            y_pos = 35 + i * 25
            # Draw color indicator
            draw.rectangle([15, y_pos, 25, y_pos + 15], fill=obj["color"])
            # Draw category name
            text = f"{obj['description']} (Severity: {obj['severity']})"
            if font:
                draw.text((30, y_pos), text, fill="black", font=small_font)
            else:
                draw.text((30, y_pos), text, fill="black")
    
    return annotated_image

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str
    """Detect and classify specific trash and debris objects"""
    
    # Detailed trash classification with severity levels
    trash_categories = {
        "plastic_bottles": {
            "prompts": ["plastic water bottles on beach", "plastic soda bottles in sand"],
            "severity": 6,
            "description": "Plastic bottles"
        },
        "plastic_bags": {
            "prompts": ["plastic shopping bags on beach", "plastic bags blowing in wind"],
            "severity": 7,
            "description": "Plastic bags"
        },
        "cigarette_butts": {
            "prompts": ["cigarette butts in sand", "cigarette filters on beach"],
            "severity": 4,
            "description": "Cigarette butts"
        },
        "food_containers": {
            "prompts": ["takeaway containers on beach", "food packaging waste"],
            "severity": 5,
            "description": "Food containers and packaging"
        },
        "cans_bottles": {
            "prompts": ["aluminum cans on beach", "glass bottles in sand"],
            "severity": 5,
            "description": "Cans and glass bottles"
        },
        "fishing_debris": {
            "prompts": ["fishing nets on beach", "fishing lines and hooks"],
            "severity": 8,
            "description": "Fishing equipment and nets"
        },
        "large_debris": {
            "prompts": ["large pieces of trash", "furniture or appliances on beach"],
            "severity": 9,
            "description": "Large debris items"
        },
        "microplastics": {
            "prompts": ["small plastic fragments", "tiny plastic pieces in sand"],
            "severity": 6,
            "description": "Microplastics and fragments"
        },
        "paper_cardboard": {
            "prompts": ["paper litter on beach", "cardboard boxes and packaging"],
            "severity": 3,
            "description": "Paper and cardboard waste"
        },
        "chemical_containers": {
            "prompts": ["chemical containers on beach", "hazardous waste containers"],
            "severity": 10,
            "description": "Chemical or hazardous containers"
        }
    }
    
    detected_objects = []
    
    for category, details in trash_categories.items():
        inputs = processor(
            text=details["prompts"],
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)[0]
            max_prob = torch.max(probs)
            
            # Adjusted threshold based on severity
            threshold = 0.08 if details["severity"] >= 8 else 0.12 if details["severity"] >= 6 else 0.15
            
            if max_prob > threshold:
                detected_objects.append({
                    "category": category,
                    "confidence": float(max_prob),
                    "severity": details["severity"],
                    "description": details["description"]
                })
    
    return detected_objects

def distinguish_natural_vs_artificial(image: Image.Image) -> Dict:
    """Distinguish between natural beach elements and artificial debris"""
    
    natural_vs_artificial = [
        "natural driftwood logs on beach",
        "natural seaweed and kelp",
        "natural rocks and pebbles",
        "natural shells and coral",
        "construction debris and concrete",
        "artificial plastic debris",
        "metal and industrial waste",
        "processed wood and lumber scraps"
    ]
    
    inputs = processor(
        text=natural_vs_artificial,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]
    
    natural_score = float(sum(probs[:4]))  # First 4 are natural
    artificial_score = float(sum(probs[4:]))  # Last 4 are artificial
    
    return {
        "natural_score": natural_score,
        "artificial_score": artificial_score,
        "natural_ratio": natural_score / (natural_score + artificial_score) if (natural_score + artificial_score) > 0 else 0.5
    }

def calculate_advanced_cleanliness_score(
    detected_objects: List[Dict],
    beach_characteristics: Dict,
    natural_artificial: Dict
) -> Tuple[float, Dict]:
    """Calculate sophisticated cleanliness score using advanced mathematics"""
    
    # Base score starts at 95 (acknowledging that some litter is normal)
    base_score = 95.0
    
    # Size adjustment factor
    size_factors = {"large": 1.2, "medium": 1.0, "small": 0.8}
    size_multiplier = size_factors.get(beach_characteristics["estimated_size"], 1.0)
    
    # Calculate trash density and impact
    total_severity = 0
    total_confidence = 0
    object_count = len(detected_objects)
    
    for obj in detected_objects:
        # Weighted severity by confidence
        weighted_severity = obj["severity"] * obj["confidence"]
        total_severity += weighted_severity
        total_confidence += obj["confidence"]
    
    if object_count > 0:
        # Average severity weighted by confidence
        avg_weighted_severity = total_severity / object_count
        avg_confidence = total_confidence / object_count
        
        # Density penalty (more objects = worse, but with diminishing returns)
        density_penalty = 10 * math.log(1 + object_count) * size_multiplier
        
        # Severity penalty (exponential for high severity items)
        severity_penalty = avg_weighted_severity * (1 + math.exp((avg_weighted_severity - 5) / 3))
        
        # Confidence adjustment (lower confidence = lower penalty)
        confidence_adjustment = 0.5 + (avg_confidence * 0.5)
        
        # Total penalty
        total_penalty = (density_penalty + severity_penalty) * confidence_adjustment
        
        # Apply natural vs artificial adjustment
        natural_bonus = natural_artificial["natural_ratio"] * 5  # Up to 5 points back for natural elements
        
        final_score = base_score - total_penalty + natural_bonus
    else:
        final_score = base_score
    
    # Ensure score is within 0-100 range
    final_score = max(0, min(100, final_score))
    
    # Detailed analysis
    analysis = {
        "base_score": base_score,
        "object_count": object_count,
        "total_severity": total_severity,
        "size_adjustment": size_multiplier,
        "natural_bonus": natural_artificial["natural_ratio"] * 5 if object_count > 0 else 0,
        "final_penalty": total_severity * (1 + math.exp((total_severity / max(object_count, 1) - 5) / 3)) if object_count > 0 else 0
    }
    
    return final_score, analysis

def categorize_cleanliness(score: float) -> str:
    """Categorize cleanliness level with refined thresholds"""
    if score >= 90:
        return "Pristine"
    elif score >= 80:
        return "Very Clean"
    elif score >= 70:
        return "Clean"
    elif score >= 60:
        return "Moderately Clean"
    elif score >= 45:
        return "Needs Attention"
    elif score >= 30:
        return "Poor"
    else:
        return "Heavily Polluted"

def generate_detailed_recommendations(
    score: float,
    detected_objects: List[Dict],
    beach_characteristics: Dict
) -> str:
    """Generate specific recommendations based on detailed analysis"""
    
    recommendations = []
    
    # Score-based recommendations
    if score >= 90:
        recommendations.append("Excellent maintenance. Continue current practices.")
    elif score >= 80:
        recommendations.append("Very good condition. Minor preventive measures recommended.")
    elif score >= 70:
        recommendations.append("Good condition. Regular monitoring and occasional cleanup needed.")
    elif score >= 60:
        recommendations.append("Moderate condition. Increase cleanup frequency.")
    elif score >= 45:
        recommendations.append("Needs attention. Implement regular cleanup schedule.")
    else:
        recommendations.append("Poor condition. Immediate intervention required.")
    
    # Object-specific recommendations
    high_severity_objects = [obj for obj in detected_objects if obj["severity"] >= 8]
    if high_severity_objects:
        recommendations.append("High-priority items detected: immediate removal of hazardous debris required.")
    
    plastic_objects = [obj for obj in detected_objects if "plastic" in obj["category"]]
    if len(plastic_objects) > 2:
        recommendations.append("High plastic pollution detected. Consider plastic-specific cleanup campaign.")
    
    # Size-specific recommendations
    if beach_characteristics["estimated_size"] == "large":
        recommendations.append("Large beach area: coordinate with local authorities for systematic cleanup.")
    elif beach_characteristics["estimated_size"] == "small":
        recommendations.append("Small beach area: community-based cleanup efforts would be effective.")
    
    return " ".join(recommendations)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_beach_cleanliness(payload: AnalyzeRequest):
    """
    Advanced beach cleanliness analysis with detailed object detection
    Returns comprehensive analysis with accurate scoring
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
        
        # Generate response
        category = categorize_cleanliness(score)
        recommendations = generate_detailed_recommendations(score, detected_objects, beach_characteristics)
        
        # Calculate overall confidence
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
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-image")
async def analyze_image_endpoint(payload: AnalyzeRequest):
    """
    Analyze image and return annotated image as downloadable file
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
            "chemical_containers": {"severity": 10, "description": "Hazardous containers"}
        },
        "scoring_system": {
            "base_score": 95,
            "natural_elements_bonus": "Up to 5 points",
            "size_adjustment": "Large beaches get 20% more tolerance",
            "severity_weighting": "Exponential penalty for high-severity items"
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
            "Detailed mathematical analysis"
        ],
        "endpoints": {
            "analyze": "/analyze - POST: Analyze beach cleanliness with optional annotated image",
            "analyze-image": "/analyze-image - POST: Get annotated image as downloadable file",
            "categories": "/categories - GET: Detection categories info",
            "health": "/health - GET: Health check",
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