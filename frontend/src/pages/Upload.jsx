import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { UploadCloud, Image, AlertCircle, X, Crop, RotateCw, ZoomIn, ZoomOut, Check, Loader2 } from 'lucide-react';

export default function Upload() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview && typeof img.preview === 'string' && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
      }
      });
    };
  }, [images]);

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please use JPG, PNG, GIF, or WebP.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
    }
    
    return { valid: true };
  };

  const processImage = (file) => {
    if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
      throw new Error('Image processing is only supported in the browser environment.');
    }
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Resize if too large (max 1920x1920)
        const maxSize = 1920;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to process image.'));
            return;
          }
          const processedFile = new File([blob], file.name, { type: file.type });
          resolve(processedFile);
        }, file.type, 0.9);
      };

      img.onerror = (e) => {
        reject(new Error('Failed to load image for processing.'));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    const newImages = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const processedFile = await processImage(file);
        const preview = URL.createObjectURL(processedFile);
        
        newImages.push({
          file: processedFile,
          preview,
          name: file.name,
          size: processedFile.size,
          status: 'pending', // pending, processing, completed, error
          result: null,
          error: null
        });
      } catch (error) {
        console.error('Error processing image:', error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setLoading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length > 0) {
      const event = { target: { files } };
      await handleImageChange(event);
    }
  };

  const removeImage = (index) => {
    const image = images[index];
    if (image.preview && typeof image.preview === 'string' && image.preview.startsWith('blob:')) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImage = async (imageIndex) => {
    const image = images[imageIndex];
    if (!image || image.status === 'processing') return;

    setImages(prev => prev.map((img, i) => 
      i === imageIndex ? { ...img, status: 'processing' } : img
    ));

    setUploadProgress(prev => ({ ...prev, [imageIndex]: 0 }));

    try {
      const formData = new FormData();
      formData.append('image', image.file);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      setImages(prev => prev.map((img, i) => 
        i === imageIndex ? { ...img, status: 'completed', result } : img
      ));
      
      setUploadProgress(prev => ({ ...prev, [imageIndex]: 100 }));
    } catch (error) {
      console.error('Analysis failed:', error);
      setImages(prev => prev.map((img, i) => 
        i === imageIndex ? { ...img, status: 'error', error: error.message } : img
      ));
      }
  };

  const analyzeAllImages = async () => {
    setLoading(true);
    const pendingImages = images.filter(img => img.status === 'pending');
    
    for (let i = 0; i < pendingImages.length; i++) {
      const imageIndex = images.findIndex(img => img === pendingImages[i]);
      await analyzeImage(imageIndex);
      // Small delay between requests to avoid overwhelming the server
      if (i < pendingImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
      setLoading(false);
  };

  const viewResults = () => {
    const completedImages = images.filter(img => img.status === 'completed');
    if (completedImages.length > 0) {
      navigate('/batch-results', { state: { results: completedImages } });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <UploadCloud className="w-4 h-4 text-gray-400" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <Check className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <UploadCloud className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'processing': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-deer to-royalbrown rounded-full mb-6 shadow-lg">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-4">Advanced Image Upload</h2>
          <p className="text-lg font-helvetica text-axolotl dark:text-gray-400 max-w-2xl mx-auto">
            Upload multiple plant images for batch analysis. Our AI will detect diseases in each image with high accuracy and provide detailed insights.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <div
            className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative overflow-hidden ${
              isDragOver 
                ? 'border-deer bg-gradient-to-br from-deer/10 to-royalbrown/10 scale-105 shadow-lg' 
                : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:border-asparagus/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-asparagus rounded-full"></div>
              <div className="absolute top-12 right-8 w-4 h-4 bg-deer rounded-full"></div>
              <div className="absolute bottom-8 left-12 w-6 h-6 border-2 border-royalbrown rounded-full"></div>
              <div className="absolute bottom-16 right-4 w-3 h-3 bg-asparagus rounded-full"></div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="upload-input"
            />
            <label htmlFor="upload-input" className="cursor-pointer block">
              <div className="space-y-6 relative z-10">
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-gradient-to-br from-deer to-royalbrown shadow-lg scale-110' 
                    : 'bg-gradient-to-br from-asparagus/20 to-deer/20'
                }`}>
                  <UploadCloud className={`w-10 h-10 transition-all duration-300 ${
                    isDragOver ? 'text-white' : 'text-asparagus'
                  }`} />
                </div>
                <div>
                  <p className="text-xl font-hank text-pathlo dark:text-white mb-3">
                    {isDragOver ? 'Drop your plant images here' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-sm text-axolotl dark:text-gray-400 max-w-md mx-auto">
                    Supports JPG, PNG, GIF, WebP up to 10MB each. Upload multiple plant images for batch analysis.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-hank text-pathlo dark:text-white">
                Uploaded Images ({images.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={analyzeAllImages}
                  disabled={loading || images.every(img => img.status !== 'pending')}
                  className="bg-deer hover:bg-royalbrown disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Analyze All
                    </>
                  )}
                </button>
                {images.some(img => img.status === 'completed') && (
                  <button
                    onClick={viewResults}
                    className="bg-asparagus hover:bg-axolotl text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    View Results
                  </button>
        )}
      </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="relative">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-pathlo dark:text-white truncate">
                        {image.name}
                      </span>
                      {getStatusIcon(image.status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    
                    {image.status === 'completed' && image.result && (
                      <div className="text-xs">
                        <span className="text-green-600 font-medium">
                          {image.result.predicted_class}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {(image.result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    
                    {image.status === 'error' && (
                      <div className="text-xs text-red-500">
                        {image.error}
                      </div>
                    )}
                    
                    {image.status === 'pending' && (
      <button
                        onClick={() => analyzeImage(index)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
      >
                        Analyze
      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}