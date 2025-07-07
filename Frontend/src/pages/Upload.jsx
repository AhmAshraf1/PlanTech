import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Upload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const navigate = useNavigate();

  // Cleanup object URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPreview(null);
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    setImage(file);
    setPreviewError(false);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewError(true);
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;

    console.log('Starting upload process...');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Image file:', image.name, image.type, image.size);

    const formData = new FormData();
    formData.append('image', image);

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
    }

    try {
      setLoading(true);

      // Check if the image is valid before submitting
      if (previewError) {
        throw new Error('The selected image appears to be invalid or corrupted');
      }

      console.log('Making fetch request to:', `${API_BASE_URL}/predict`);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Get response text for debugging
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);

        if (response.status === 403) {
          throw new Error('Access denied. CORS issue detected.');
        }
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Prediction success:', data);

      // Pass both the result data and the local preview image to Results page
      navigate('/results', {
        state: {
          result: data,
          preview: preview
        }
      });
    } catch (err) {
      console.error('Prediction failed:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      // More descriptive error message
      alert(`Prediction failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-hank text-pathlo mb-4">Upload Leaf Image</h2>

      <div className="border-4 border-dashed border-asparagus p-8 rounded-2xl bg-gray-100 text-center mb-4 w-full max-w-md">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="upload-input"
        />
        <label htmlFor="upload-input" className="cursor-pointer text-axolotl font-semibold">
          {image ? 'Change Image' : 'Click to Upload or Drag & Drop'}
        </label>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            onError={(e) => {
              console.error('Image preview failed to load:', preview);
              setPreviewError(true);
              setPreview(null);
              e.target.src = '';
            }}
            className="mt-4 rounded-xl max-h-64 object-contain"
          />
        ) : (
          image && (
            <p className="text-sm text-red-500 mt-4">
              {previewError
                ? "Error loading preview. The image may be corrupted or in an unsupported format."
                : "Preview not available. Please try another image."}
            </p>
          )
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-deer hover:bg-royalbrown text-white font-semibold py-2 px-6 rounded-xl transition duration-300 disabled:opacity-50"
        disabled={!image || loading}
      >
        {loading ? 'Predicting...' : 'Submit'}
      </button>

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500">
        <p>API Base URL: {API_BASE_URL}</p>
        <p>File selected: {image ? `${image.name} (${image.type})` : 'None'}</p>
      </div>
    </div>
  );
}