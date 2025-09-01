import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertCircle, ShieldCheck, ArrowLeft, TrendingUp, Leaf, Zap, Clock, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preview, result } = location.state || {};

  const getConfidenceColor = (score) => {
    if (score >= 0.85) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.85) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getConfidenceIcon = (score) => {
    if (score >= 0.85) return <BadgeCheck className="w-5 h-5 text-green-600" />;
    if (score >= 0.6) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      'healthy': 'text-green-600 bg-green-100 dark:bg-green-900/20',
      'powdery_mildew': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      'rust': 'text-red-600 bg-red-100 dark:bg-red-900/20',
      'leaf_spot': 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      'blight': 'text-brown-600 bg-brown-100 dark:bg-brown-900/20'
    };
    return colors[disease?.toLowerCase()] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 text-axolotl hover:text-pathlo dark:text-gray-400 dark:hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Upload
          </button>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-xl">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-hank text-pathlo dark:text-white mb-6">
            Analysis Complete!
          </h2>
          <p className="text-xl font-helvetica text-axolotl dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our AI has analyzed your plant image and detected the following condition
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">
              {result?.predicted_class || 'N/A'}
            </div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Detected Condition</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">
              {(result?.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Confidence Level</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">&lt;5s</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Analysis Time</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-hank text-pathlo dark:text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-asparagus to-deer rounded-full flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              Analyzed Image
            </h3>
            {result?.image_url && (
              <div className="relative group">
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
                          errorMsg.className = 'absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-xl';
                          errorMsg.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center p-4">Image could not be loaded</p>';
                          parent.appendChild(errorMsg);
                        }
                      };
                    } else {
                      // No fallback available
                      e.target.src = '';
                      e.target.classList.add('image-load-error');
                    }
                  }}
                  className="rounded-xl w-full h-80 object-cover shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-hank text-pathlo dark:text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-deer to-royalbrown rounded-full flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
              Detection Results
            </h3>

            {/* Predicted Class */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-axolotl dark:text-gray-300 mb-3">Detected Condition</h4>
              <div className={`p-4 rounded-xl border-2 ${getDiseaseColor(result?.predicted_class)}`}>
                <p className="text-3xl font-hank text-pathlo dark:text-white">{result?.predicted_class || 'N/A'}</p>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-axolotl dark:text-gray-300">Confidence Level</h4>
                <div className="flex items-center gap-2">
                  {getConfidenceIcon(result?.confidence)}
                  <span className="text-sm font-medium text-axolotl dark:text-gray-400">
                    {getConfidenceText(result?.confidence)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 shadow-inner">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ease-out ${getConfidenceColor(result?.confidence)} shadow-lg`}
                    style={{ width: `${(result?.confidence * 100).toFixed(1)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-helvetica text-gray-600 dark:text-gray-400">
                    Confidence Score
                  </span>
                  <span className="text-2xl font-bold text-pathlo dark:text-white">
                    {(result?.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Warning for low confidence */}
            {result?.confidence < 0.6 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">Low Confidence Warning</h5>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The confidence level is below 60%. Consider uploading a clearer, higher-quality image for more accurate results.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/upload')}
                className="w-full bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <Leaf className="w-5 h-5" />
                Analyze Another Image
              </button>
              <button
                onClick={() => navigate('/history')}
                className="w-full bg-gradient-to-r from-pathlo to-axolotl hover:from-axolotl hover:to-pathlo text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <BarChart3 className="w-5 h-5" />
                View Analysis History
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-gradient-to-r from-asparagus/10 to-deer/10 dark:from-asparagus/20 dark:to-deer/20 rounded-2xl p-8 border border-asparagus/20">
          <div className="text-center">
            <h3 className="text-2xl font-hank text-pathlo dark:text-white mb-4">What's Next?</h3>
            <p className="text-axolotl dark:text-gray-400 mb-6 font-helvetica max-w-2xl mx-auto">
              Based on your analysis results, you can now take appropriate action to maintain your plant's health. 
              Consider researching treatment options for the detected condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/faq')}
                className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-pathlo dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border border-gray-200 dark:border-gray-600"
              >
                Get Help & Support
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-pathlo dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border border-gray-200 dark:border-gray-600"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
