import { useEffect, useState } from 'react';
import { Clock, FileSearch } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching history from:', `${API_BASE_URL}/history`);

    fetch(`${API_BASE_URL}/history`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(res => {
        console.log('History response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('History data received:', data);
        setPredictions(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching history:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white text-pathlo flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-axolotl animate-spin mx-auto mb-4" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-white text-pathlo">
        <h2 className="text-3xl font-hank mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-axolotl animate-pulse" /> Prediction History
        </h2>
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">
          Error loading history: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white text-pathlo">
      <h2 className="text-3xl font-hank mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-axolotl animate-pulse" /> Prediction History
      </h2>

      {predictions.length === 0 ? (
        <div className="text-gray-500 flex items-center gap-2">
          <FileSearch className="w-5 h-5" /> No history available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {predictions.map((item) => (
            <div
              key={item.id}
              className="bg-gray-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={`${API_BASE_URL}${item.image_url}`}
                  alt={`Prediction ${item.id}`}
                  onError={(e) => {
                    console.error(`Failed to load history image for ${item.id}:`, e);
                    console.error('Image URL:', `${API_BASE_URL}${item.image_url}`);
                    // Remove the src to prevent further error loops
                    e.target.src = '';
                    // Add a class to show a placeholder or error state
                    e.target.classList.add('image-load-error');
                    // Add a text overlay to indicate the error
                    const parent = e.target.parentNode;
                    if (parent && !parent.querySelector('.error-overlay')) {
                      const errorMsg = document.createElement('div');
                      errorMsg.className = 'error-overlay absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg';
                      errorMsg.innerHTML = '<p class="text-red-500 text-center p-2 text-sm">Image unavailable</p>';
                      parent.appendChild(errorMsg);
                    }
                  }}
                  className="rounded-lg mb-3 max-h-48 object-cover w-full"
                />
              </div>
              <h4 className="font-bold text-deer text-lg mb-1">{item.class}</h4>
              <p className="text-sm font-helvetica text-gray-600">
                Confidence: <span className="font-semibold text-pathlo">{(item.confidence * 100).toFixed(1)}%</span>
              </p>
              <p className="text-sm font-helvetica text-gray-400 mt-1">
                Date: {formatTimestamp(item.timestamp)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Debug info - remove this in production */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p>Debug Info:</p>
        <p>API Base URL: {API_BASE_URL}</p>
        <p>Total predictions loaded: {predictions.length}</p>
        {predictions.length > 0 && (
          <p>Sample prediction: {JSON.stringify(predictions[0], null, 2)}</p>
        )}
      </div>
    </div>
  );
}