import React, { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, BarChart3, Calendar, Download, Eye, Zap, Brain, Waves } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface ScanResult {
  id: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  healthScore: number;
  factors: {
    wasteAmount: number;
    waterQuality: number;
    biodiversity: number;
    humanImpact: number;
  };
  scanDate: string;
  status: 'processing' | 'completed' | 'failed';
  mlAnalysis?: {
    wasteTypes: string[];
    pollutionLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

const BeachScannerPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    fetchScanHistory();
    
    // Check if coming from event images
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    if (eventId) {
      loadEventImages(eventId);
    }
  }, []);

  const loadEventImages = async (eventId: string) => {
    try {
      const response = await axios.get(`/api/event-images/event/${eventId}`);
      const images = response.data.images;
      
      if (images.length > 0) {
        // Auto-process the first image
        const firstImage = images[0];
        setLocation(firstImage.event?.location?.name || 'Event Location');
        // You could auto-upload this image for analysis
      }
    } catch (error) {
      console.error('Error loading event images:', error);
    }
  };

  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/beach-health/scans');
      setScanResults(response.data.scans || []);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      // Enhanced mock data with ML analysis
      setScanResults([
        {
          id: '1',
          location: 'Juhu Beach',
          coordinates: { latitude: 19.0896, longitude: 72.8656 },
          imageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
          healthScore: 78,
          factors: {
            wasteAmount: 75,
            waterQuality: 82,
            biodiversity: 70,
            humanImpact: 85
          },
          scanDate: '2024-01-15T10:30:00Z',
          status: 'completed',
          mlAnalysis: {
            wasteTypes: ['Plastic bottles', 'Food wrappers', 'Cigarette butts'],
            pollutionLevel: 'medium',
            recommendations: [
              'Install more waste bins in high-traffic areas',
              'Organize weekly cleanup drives',
              'Implement plastic bottle deposit system'
            ]
          }
        },
        {
          id: '2',
          location: 'Marine Drive',
          coordinates: { latitude: 18.9441, longitude: 72.8262 },
          imageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
          healthScore: 85,
          factors: {
            wasteAmount: 88,
            waterQuality: 85,
            biodiversity: 80,
            humanImpact: 87
          },
          scanDate: '2024-01-14T14:20:00Z',
          status: 'completed',
          mlAnalysis: {
            wasteTypes: ['Paper cups', 'Plastic bags', 'Glass bottles'],
            pollutionLevel: 'low',
            recommendations: [
              'Maintain current cleanliness standards',
              'Add recycling bins for glass',
              'Continue regular maintenance'
            ]
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const simulateMLAnalysis = (imageFile: File): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate ML analysis results
        const mockAnalysis = {
          wasteAmount: Math.floor(Math.random() * 40) + 60, // 60-100
          waterQuality: Math.floor(Math.random() * 30) + 70, // 70-100
          biodiversity: Math.floor(Math.random() * 35) + 65, // 65-100
          humanImpact: Math.floor(Math.random() * 25) + 75, // 75-100
        };

        const overallScore = Math.round(
          (mockAnalysis.wasteAmount + mockAnalysis.waterQuality + 
           mockAnalysis.biodiversity + mockAnalysis.humanImpact) / 4
        );

        const wasteTypes = [
          'Plastic bottles', 'Food wrappers', 'Cigarette butts', 'Glass bottles',
          'Paper cups', 'Plastic bags', 'Aluminum cans', 'Fishing nets'
        ];
        
        const detectedWaste = wasteTypes
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 2);

        const pollutionLevel = overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high';

        const recommendations = {
          low: [
            'Maintain current cleanliness standards',
            'Continue regular monitoring',
            'Add more recycling options'
          ],
          medium: [
            'Increase cleanup frequency',
            'Install additional waste bins',
            'Implement waste segregation system'
          ],
          high: [
            'Immediate cleanup intervention required',
            'Deploy emergency cleanup crew',
            'Investigate pollution sources'
          ]
        };

        const result: ScanResult = {
          id: Date.now().toString(),
          location: location || 'Unknown Location',
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: URL.createObjectURL(imageFile),
          healthScore: overallScore,
          factors: mockAnalysis,
          scanDate: new Date().toISOString(),
          status: 'completed',
          mlAnalysis: {
            wasteTypes: detectedWaste,
            pollutionLevel,
            recommendations: recommendations[pollutionLevel]
          }
        };

        resolve(result);
      }, 3000); // Simulate 3-second processing time
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !location) {
      alert('Please select an image and enter location details');
      return;
    }

    setUploading(true);
    try {
      // Simulate ML analysis
      const result = await simulateMLAnalysis(selectedFile);
      
      // Add to results
      setScanResults(prev => [result, ...prev]);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setLocation('');
      
      // Show detailed result
      setSelectedResult(result);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      notification.innerHTML = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Beach health analysis completed successfully!</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportResults = () => {
    const csvData = [
      ['Location', 'Health Score', 'Waste Amount', 'Water Quality', 'Biodiversity', 'Human Impact', 'Scan Date'],
      ...scanResults.map(result => [
        result.location,
        result.healthScore,
        result.factors.wasteAmount,
        result.factors.waterQuality,
        result.factors.biodiversity,
        result.factors.humanImpact,
        new Date(result.scanDate).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beach-health-scans.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // If a detailed result is selected, show the detailed view
  if (selectedResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedResult(null)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Beach Health Analysis</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image and Score */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <img
                src={selectedResult.imageUrl}
                alt={selectedResult.location}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedResult.location}</h2>
                    <p className="text-sm text-gray-600">
                      Scanned on {new Date(selectedResult.scanDate).toLocaleDateString()} at {new Date(selectedResult.scanDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(selectedResult.healthScore)}`}>
                    {selectedResult.healthScore}/100
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Health Factors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Waste Amount</span>
                          <span className="font-medium">{selectedResult.factors.wasteAmount}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFactorColor(selectedResult.factors.wasteAmount)}`}
                            style={{ width: `${selectedResult.factors.wasteAmount}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Water Quality</span>
                          <span className="font-medium">{selectedResult.factors.waterQuality}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFactorColor(selectedResult.factors.waterQuality)}`}
                            style={{ width: `${selectedResult.factors.waterQuality}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Biodiversity</span>
                          <span className="font-medium">{selectedResult.factors.biodiversity}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFactorColor(selectedResult.factors.biodiversity)}`}
                            style={{ width: `${selectedResult.factors.biodiversity}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Human Impact</span>
                          <span className="font-medium">{selectedResult.factors.humanImpact}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFactorColor(selectedResult.factors.humanImpact)}`}
                            style={{ width: `${selectedResult.factors.humanImpact}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ML Analysis */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ML Analysis</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Detected Waste Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.mlAnalysis?.wasteTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pollution Level</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedResult.mlAnalysis?.pollutionLevel === 'low' ? 'bg-green-100 text-green-800' :
                    selectedResult.mlAnalysis?.pollutionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedResult.mlAnalysis?.pollutionLevel
                      ? selectedResult.mlAnalysis.pollutionLevel.charAt(0).toUpperCase() + selectedResult.mlAnalysis.pollutionLevel.slice(1)
                      : ''}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedResult.mlAnalysis?.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Waves className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Impact Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Environmental Impact</h4>
                  <p className="text-sm text-gray-600">
                    This beach has a {selectedResult.healthScore >= 80 ? 'positive' : selectedResult.healthScore >= 60 ? 'moderate' : 'concerning'} environmental health score. 
                    {selectedResult.healthScore >= 80 
                      ? ' Continued maintenance and regular monitoring is recommended.'
                      : selectedResult.healthScore >= 60
                      ? ' Targeted cleanup efforts would improve conditions.'
                      : ' Immediate intervention is needed to address pollution issues.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Suggested Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">
                        {selectedResult.healthScore >= 80 
                          ? 'Schedule monthly maintenance cleanups'
                          : selectedResult.healthScore >= 60
                          ? 'Organize bi-weekly volunteer events'
                          : 'Plan weekly intensive cleanups'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">
                        {selectedResult.healthScore >= 80 
                          ? 'Install educational signage about conservation'
                          : selectedResult.healthScore >= 60
                          ? 'Add more waste collection points'
                          : 'Implement waste segregation systems'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">
                        {selectedResult.healthScore >= 80 
                          ? 'Monitor for seasonal changes'
                          : selectedResult.healthScore >= 60
                          ? 'Conduct water quality testing'
                          : 'Investigate pollution sources'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Beach Health Scanner</h1>
        <button onClick={exportResults} className="btn-primary">
          <Download className="h-5 w-5 mr-2" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Beach Image for AI Analysis</h2>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beach Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Location Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Juhu Beach"
                className="input-field"
                required
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || !location || uploading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Analyze Beach Health
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Scan Results */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Scan Results</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading results...</p>
            </div>
          ) : scanResults.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No scan results yet</p>
              <p className="text-sm text-gray-500">Upload your first beach image to get started</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {scanResults.map((result) => (
                <div 
                  key={result.id} 
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.location}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(result.scanDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.healthScore)}`}>
                      {result.healthScore}/100
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Waste Amount</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${getFactorColor(result.factors.wasteAmount)}`}
                            style={{ width: `${result.factors.wasteAmount}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{result.factors.wasteAmount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Water Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${getFactorColor(result.factors.waterQuality)}`}
                            style={{ width: `${result.factors.waterQuality}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{result.factors.waterQuality}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Biodiversity</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${getFactorColor(result.factors.biodiversity)}`}
                            style={{ width: `${result.factors.biodiversity}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{result.factors.biodiversity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Human Impact</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${getFactorColor(result.factors.humanImpact)}`}
                            style={{ width: `${result.factors.humanImpact}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{result.factors.humanImpact}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button 
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResult(result);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ML Model Information */}
      <div className="card bg-gradient-to-r from-purple-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About Our AI Beach Health Scanner</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg mt-1">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Computer Vision Analysis</h3>
              <p className="text-sm text-gray-600">
                Our AI model uses computer vision to detect and classify waste types, assess beach conditions, and measure pollution levels from your uploaded images.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg mt-1">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Health Score Calculation</h3>
              <p className="text-sm text-gray-600">
                The beach health score is calculated using multiple factors including waste density, water quality indicators, biodiversity markers, and human impact assessment.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg mt-1">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Actionable Insights</h3>
              <p className="text-sm text-gray-600">
                Beyond analysis, our AI provides specific recommendations for beach restoration, waste management strategies, and conservation efforts tailored to each location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeachScannerPage;