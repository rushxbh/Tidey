import React, { useState } from 'react';
import { Camera, Upload, MapPin, BarChart3, Calendar, Download, Eye } from 'lucide-react';
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
}

const BeachScannerPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [uploading, setUploading] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/beach-health/scans');
      setScanResults(response.data.scans || []);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      // Mock data for demo
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
          status: 'completed'
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
          status: 'completed'
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

  const handleUpload = async () => {
    if (!selectedFile || !location) {
      alert('Please select an image and enter location details');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('location', location);
      if (coordinates.latitude) formData.append('latitude', coordinates.latitude);
      if (coordinates.longitude) formData.append('longitude', coordinates.longitude);

      const response = await axios.post('/api/beach-health/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Image uploaded successfully! ML analysis is in progress.');
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setLocation('');
      setCoordinates({ latitude: '', longitude: '' });
      
      // Refresh scan history
      fetchScanHistory();
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Beach Image for Analysis</h2>
          
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="19.0896"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="72.8656"
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || !location || uploading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
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
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {scanResults.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scanResults.slice(0, 3).map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={result.imageUrl}
                  alt={result.location}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{result.location}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(result.healthScore)}`}>
                      {result.healthScore}/100
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Waste Amount</span>
                      <span className="font-medium">{result.factors.wasteAmount}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getFactorColor(result.factors.wasteAmount)}`}
                        style={{ width: `${result.factors.wasteAmount}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Water Quality</span>
                      <span className="font-medium">{result.factors.waterQuality}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getFactorColor(result.factors.waterQuality)}`}
                        style={{ width: `${result.factors.waterQuality}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(result.scanDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeachScannerPage;