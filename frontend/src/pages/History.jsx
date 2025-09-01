import { useEffect, useState } from 'react';
import { Clock, FileSearch, Calendar, TrendingUp, AlertCircle, Search, Filter, SortAsc, SortDesc, Download, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

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
        // Use data.results for predictions
        const results = Array.isArray(data.results) ? data.results : [];
        setPredictions(results);
        setFilteredPredictions(results);
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

  // Filter and sort predictions
  useEffect(() => {
    let filtered = [...predictions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.predicted_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         formatTimestamp(item.created_at).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        switch (dateFilter) {
          case 'today':
            return itemDate >= today;
          case 'yesterday':
            return itemDate >= yesterday && itemDate < today;
          case 'week':
            return itemDate >= lastWeek;
          case 'month':
            return itemDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (confidenceFilter) {
          case 'high':
            return item.confidence >= 0.85;
          case 'medium':
            return item.confidence >= 0.6 && item.confidence < 0.85;
          case 'low':
            return item.confidence < 0.6;
          default:
            return true;
        }
      });
    }

    // Disease filter
    if (diseaseFilter !== 'all') {
      filtered = filtered.filter(item => item.predicted_class === diseaseFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'disease':
          aValue = a.predicted_class?.toLowerCase();
          bValue = b.predicted_class?.toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPredictions(filtered);
  }, [predictions, searchTerm, dateFilter, confidenceFilter, diseaseFilter, sortBy, sortOrder]);

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      return timestamp;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.85) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBgColor = (score) => {
    if (score >= 0.85) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceIcon = (score) => {
    if (score >= 0.85) return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (score >= 0.6) return <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      'Healthy': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      'Powdery': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      'Rust': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      'Slug': 'text-brown-600 dark:text-brown-400 bg-brown-50 dark:bg-brown-900/20',
      'Spot': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    };
    return colors[disease] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  // Get unique diseases for filter
  const uniqueDiseases = [...new Set(predictions.map(p => p.predicted_class).filter(Boolean))];

  // Calculate statistics
  const totalAnalyses = predictions.length;
  const highConfidence = predictions.filter(p => p.confidence >= 0.85).length;
  const averageConfidence = predictions.length > 0 ? 
    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length : 0;
  const diseaseCounts = predictions.reduce((acc, p) => {
    const disease = p.predicted_class;
    if (disease) {
      acc[disease] = (acc[disease] || 0) + 1;
    }
    return acc;
  }, {});

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Image Name', 'Disease Detected', 'Confidence', 'Image URL'],
      ...filteredPredictions.map(item => [
        formatTimestamp(item.created_at),
        item.original_filename || 'Unknown',
        item.predicted_class || 'Unknown',
        `${(item.confidence * 100).toFixed(1)}%`,
        `${API_BASE_URL}${item.image_url}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-asparagus border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">Loading History</h3>
          <p className="text-axolotl dark:text-gray-400 font-helvetica">Fetching your prediction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-4 flex items-center justify-center gap-3">
              <Clock className="w-8 h-8 text-asparagus" />
              Prediction History
        </h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-hank text-red-800 dark:text-red-400 mb-2">Error Loading History</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-lg">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-4">
            Prediction History
          </h2>
          <p className="text-lg font-helvetica text-axolotl dark:text-gray-400 max-w-2xl mx-auto">
            Review and analyze your previous plant disease analyses with detailed insights and confidence scores
          </p>
        </div>

        {/* Statistics */}
        {predictions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-hank text-pathlo dark:text-white mb-6 text-center">Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                <div className="text-3xl font-hank text-blue-600 dark:text-blue-400 mb-2">{totalAnalyses}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Analyses</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                <div className="text-3xl font-hank text-green-600 dark:text-green-400 mb-2">{highConfidence}</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">High Confidence</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                <div className="text-3xl font-hank text-purple-600 dark:text-purple-400 mb-2">
                  {(averageConfidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Average Confidence</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700">
                <div className="text-3xl font-hank text-orange-600 dark:text-orange-400 mb-2">
                  {uniqueDiseases.length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Disease Types</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {predictions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by disease or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>

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

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="confidence-desc">Highest Confidence</option>
                  <option value="confidence-asc">Lowest Confidence</option>
                  <option value="disease-asc">Disease A-Z</option>
                  <option value="disease-desc">Disease Z-A</option>
                </select>

                <button
                  onClick={exportHistory}
                  className="bg-deer hover:bg-royalbrown text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-axolotl dark:text-gray-400">
              Showing {filteredPredictions.length} of {predictions.length} results
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        {predictions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <FileSearch className="w-16 h-16 text-axolotl mx-auto mb-4" />
            <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">No History Available</h3>
            <p className="text-axolotl dark:text-gray-400 font-helvetica mb-6">
              You haven't analyzed any images yet. Start by uploading your first plant image!
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 bg-deer hover:bg-royalbrown text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-md"
            >
              Upload First Image
            </a>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-axolotl mx-auto mb-4" />
            <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">No Results Match Your Filters</h3>
            <p className="text-axolotl dark:text-gray-400">
              Try adjusting your search terms or filters to see more results.
            </p>
        </div>
      ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPredictions.map((item, index) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 overflow-hidden group relative"
            >
              {/* Disease Type Badge */}
              <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${getDiseaseColor(item.predicted_class)}`}>
                {item.predicted_class}
              </div>
              
              {/* Confidence Badge */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <span className={getConfidenceColor(item.confidence)}>
                  {(item.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img
                  src={`${API_BASE_URL}${item.image_url}`}
                  alt={`Prediction ${item.id}`}
                  onError={(e) => {
                    console.error(`Failed to load history image for ${item.id}:`, e);
                    e.target.src = '';
                    e.target.classList.add('image-load-error');
                    const parent = e.target.parentNode;
                    if (parent && !parent.querySelector('.error-overlay')) {
                      const errorMsg = document.createElement('div');
                      errorMsg.className = 'error-overlay absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600';
                      errorMsg.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center p-2 text-sm">Image unavailable</p>';
                      parent.appendChild(errorMsg);
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-hank text-lg text-pathlo dark:text-white mb-1">{item.predicted_class}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.original_filename}</div>
                  </div>
                  {getConfidenceIcon(item.confidence)}
                </div>
                  
                                    <div className="space-y-4">
                    {/* Confidence Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-helvetica text-axolotl dark:text-gray-300">Confidence Level</span>
                        <span className={`text-sm font-bold ${getConfidenceColor(item.confidence)}`}>
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ease-out ${getConfidenceBgColor(item.confidence)} shadow-sm`}
                          style={{ width: `${Math.max(item.confidence * 100, 2)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Processing Time */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatTimestamp(item.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Processed in</span>
                        <span className="font-semibold text-asparagus dark:text-asparagus">
                          {(item.processing_time * 1000).toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}


      </div>
    </div>
  );
}