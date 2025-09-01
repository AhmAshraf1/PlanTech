import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertCircle, ShieldCheck, ArrowLeft, Download, Share2, Filter, Search, TrendingUp, Calendar, FileText, Leaf, Zap, BarChart3, Users } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function BatchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full mb-6 shadow-xl">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-hank text-pathlo dark:text-white mb-4">No Results Found</h2>
          <p className="text-lg text-axolotl dark:text-gray-400 mb-8 max-w-md mx-auto">
            No analysis results are available to display. Start by uploading some plant images for analysis.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
          >
            <Leaf className="w-5 h-5" />
            Upload Images
          </button>
        </div>
      </div>
    );
  }

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

  // Filter results based on search and filters
  const filteredResults = results.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.result?.predicted_class?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConfidence = confidenceFilter === 'all' || 
      (confidenceFilter === 'high' && result.result?.confidence >= 0.85) ||
      (confidenceFilter === 'medium' && result.result?.confidence >= 0.6 && result.result?.confidence < 0.85) ||
      (confidenceFilter === 'low' && result.result?.confidence < 0.6);
    
    const matchesDisease = diseaseFilter === 'all' || 
      result.result?.predicted_class === diseaseFilter;
    
    return matchesSearch && matchesConfidence && matchesDisease;
  });

  // Get unique diseases for filter
  const uniqueDiseases = [...new Set(results.map(r => r.result?.predicted_class).filter(Boolean))];

  // Calculate statistics
  const totalAnalyses = results.length;
  const highConfidence = results.filter(r => r.result?.confidence >= 0.85).length;
  const averageConfidence = results.reduce((sum, r) => sum + (r.result?.confidence || 0), 0) / totalAnalyses;
  const diseaseCounts = results.reduce((acc, r) => {
    const disease = r.result?.predicted_class;
    if (disease) {
      acc[disease] = (acc[disease] || 0) + 1;
    }
    return acc;
  }, {});

  const exportResults = () => {
    const csvContent = [
      ['Image Name', 'Disease Detected', 'Confidence', 'Analysis Date'],
      ...filteredResults.map(r => [
        r.name,
        r.result?.predicted_class || 'Unknown',
        `${(r.result?.confidence * 100).toFixed(1)}%`,
        new Date().toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Plant Disease Analysis Results',
        text: `Analyzed ${totalAnalyses} plant images with ${(averageConfidence * 100).toFixed(1)}% average confidence.`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Results link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 text-axolotl hover:text-pathlo dark:text-gray-400 dark:hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Upload
          </button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-xl">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-hank text-pathlo dark:text-white mb-4">
              Batch Analysis Complete!
            </h1>
            <p className="text-xl font-helvetica text-axolotl dark:text-gray-400 max-w-3xl mx-auto">
              Analysis results for {totalAnalyses} plant images with comprehensive insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={exportResults}
              className="bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 justify-center"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={shareResults}
              className="bg-gradient-to-r from-pathlo to-axolotl hover:from-axolotl hover:to-pathlo text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 justify-center"
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">{totalAnalyses}</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Total Analyses</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BadgeCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">{highConfidence}</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">High Confidence</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">{(averageConfidence * 100).toFixed(1)}%</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Avg. Confidence</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">{uniqueDiseases.length}</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Disease Types</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-6 mb-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by image name or disease..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Confidence</option>
                <option value="high">High (≥85%)</option>
                <option value="medium">Medium (60-84%)</option>
                <option value="low">Low (&lt;60%)</option>
              </select>
              <select
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Diseases</option>
                {uniqueDiseases.map(disease => (
                  <option key={disease} value={disease}>
                    {disease} ({diseaseCounts[disease]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((result, index) => (
            <div key={index} className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              {/* Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700 group">
                <img
                  src={result.preview || (result.result?.image_url ? `${API_BASE_URL}${result.result.image_url}` : '')}
                  alt={result.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  {(result.size / 1024 / 1024).toFixed(1)} MB
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-hank text-lg text-pathlo dark:text-white mb-4 truncate">
                  {result.name}
                </h3>

                {result.result ? (
                  <div className="space-y-4">
                    {/* Disease Detection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-axolotl dark:text-gray-300">Detected Disease</h4>
                        {getConfidenceIcon(result.result.confidence)}
                      </div>
                      <div className={`p-3 rounded-xl border-2 ${getDiseaseColor(result.result.predicted_class)}`}>
                        <p className="font-hank text-pathlo dark:text-white text-center">
                          {result.result.predicted_class}
                        </p>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-axolotl dark:text-gray-300">Confidence</span>
                        <span className="text-lg font-bold text-pathlo dark:text-white">
                          {(result.result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(result.result.confidence)} shadow-lg`}
                          style={{ width: `${(result.result.confidence * 100).toFixed(1)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {getConfidenceText(result.result.confidence)}
                      </p>
                    </div>

                    {/* Warning for low confidence */}
                    {result.result.confidence < 0.6 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Low Confidence</p>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              Consider uploading a clearer image for better accuracy.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Analysis failed</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Filter className="w-10 h-10 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-2xl font-hank text-pathlo dark:text-white mb-4">No Results Match Your Filters</h3>
            <p className="text-lg text-axolotl dark:text-gray-400 max-w-md mx-auto mb-6">
              Try adjusting your search terms or filters to see more results.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setConfidenceFilter('all');
                setDiseaseFilter('all');
              }}
              className="bg-gradient-to-r from-asparagus to-deer hover:from-deer hover:to-asparagus text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 