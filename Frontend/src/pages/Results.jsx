import { useLocation } from 'react-router-dom';
import { BadgeCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Results() {
  const location = useLocation();
  const { preview, result } = location.state || {};

  const getConfidenceColor = (score) => {
    if (score >= 0.85) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-hank text-pathlo mb-6 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-green-600 animate-pulse" /> Prediction Result
      </h2>

      {result?.image_url && (
        <div className="relative mb-6">
          <img
            src={`${API_BASE_URL}${result.image_url}`}
            alt="Predicted"
            onError={(e) => {
              console.error('Failed to load image from server:', e);
              // If server image fails, try to use the preview as fallback
              if (preview) {
                console.log('Using preview image as fallback');
                e.target.src = preview;
                // Add a second error handler for the fallback image
                e.target.onerror = () => {
                  console.error('Fallback preview image also failed to load');
                  // Remove the src to prevent further error loops
                  e.target.src = '';
                  // Add a class to show a placeholder or error state
                  e.target.classList.add('image-load-error');
                  // Add a text overlay to indicate the error
                  const parent = e.target.parentNode;
                  if (parent) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl';
                    errorMsg.innerHTML = '<p class="text-red-500 text-center p-4">Image could not be loaded</p>';
                    parent.appendChild(errorMsg);
                  }
                };
              } else {
                // No fallback available
                e.target.src = '';
                e.target.classList.add('image-load-error');
              }
            }}
            className="rounded-xl max-h-64 shadow-lg transition duration-300 w-full object-contain"
          />
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded-2xl shadow-md w-full max-w-md text-center transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-hank text-deer mb-2">Predicted Class</h3>
        <p className="text-2xl font-bold text-royalbrown mb-4">{result?.predicted_class || 'N/A'}</p>

        <h4 className="text-md font-semibold text-axolotl mb-2">Confidence Score</h4>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getConfidenceColor(result?.confidence)} `}
            style={{ width: `${(result?.confidence * 100).toFixed(1)}%` }}
          ></div>
        </div>
        <p className="mt-2 font-helvetica text-sm text-gray-600">{(result?.confidence * 100).toFixed(2)}%</p>

        {result?.confidence < 0.6 && (
          <div className="text-sm text-red-600 mt-4 flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" /> Confidence is low — consider trying another image.
          </div>
        )}
      </div>
    </div>
  );
}
