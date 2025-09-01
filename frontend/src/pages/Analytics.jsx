import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Calendar, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Leaf,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics?time_range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const getDiseaseColor = (disease) => {
    const colors = {
      'Healthy': 'text-green-600 dark:text-green-400',
      'Powdery': 'text-purple-600 dark:text-purple-400',
      'Rust': 'text-orange-600 dark:text-orange-400',
      'Slug': 'text-brown-600 dark:text-brown-400',
      'Spot': 'text-red-600 dark:text-red-400'
    };
    return colors[disease] || 'text-gray-600 dark:text-gray-400';
  };

  const getDiseaseBgColor = (disease) => {
    const colors = {
      'Healthy': 'bg-green-100 dark:bg-green-900/20',
      'Powdery': 'bg-purple-100 dark:bg-purple-900/20',
      'Rust': 'bg-orange-100 dark:bg-orange-900/20',
      'Slug': 'bg-brown-100 dark:bg-brown-900/20',
      'Spot': 'bg-red-100 dark:bg-red-900/20'
    };
    return colors[disease] || 'bg-gray-100 dark:bg-gray-900/20';
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return { level: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (confidence >= 0.8) return { level: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    if (confidence >= 0.7) return { level: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { level: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const getConfidenceRangeLabel = (range) => {
    const labels = {
      '0.9-1.0': 'Excellent (90-100%)',
      '0.8-0.9': 'Good (80-89%)',
      '0.7-0.8': 'Fair (70-79%)',
      '0.0-0.7': 'Poor (0-69%)'
    };
    return labels[range] || range;
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-asparagus border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">Loading Analytics</h3>
          <p className="text-axolotl dark:text-gray-400 font-helvetica">Fetching your plant health insights...</p>
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
              <BarChart3 className="w-8 h-8 text-asparagus" />
              Analytics Dashboard
            </h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-hank text-red-800 dark:text-red-400 mb-2">Error Loading Analytics</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-4 flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-asparagus to-deer rounded-full flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              Analytics Dashboard
            </h2>
            <p className="text-lg font-helvetica text-axolotl dark:text-gray-400">
              Comprehensive insights into your plant health analysis performance
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="bg-asparagus hover:bg-axolotl text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 inline-flex items-center gap-2 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center mb-6">
            <p className="text-sm text-axolotl dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshing every 30 seconds
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-axolotl dark:text-gray-400">Total Analyses</p>
                <p className="text-3xl font-hank text-pathlo dark:text-white">{analytics?.total_analyses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-axolotl dark:text-gray-400">Average Confidence</p>
                <p className="text-3xl font-hank text-pathlo dark:text-white">
                  {analytics?.average_confidence ? `${(analytics.average_confidence * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-axolotl dark:text-gray-400">High Confidence</p>
                <p className="text-3xl font-hank text-pathlo dark:text-white">
                  {analytics?.high_confidence_count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-axolotl dark:text-gray-400">Disease Types</p>
                <p className="text-3xl font-hank text-pathlo dark:text-white">
                  {analytics?.unique_diseases?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Disease Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-hank text-pathlo dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-asparagus" />
              Disease Distribution
            </h3>
            <div className="space-y-4">
              {analytics?.disease_distribution?.map((disease, index) => (
                <div key={disease.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getDiseaseBgColor(disease.name)}`}></div>
                    <span className="font-medium text-pathlo dark:text-white">{disease.name}</span>
                  </div>
                                     <div className="flex items-center gap-3">
                     <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${getDiseaseBgColor(disease.name).replace('bg-', 'bg-').replace('/20', '')}`}
                         style={{ width: `${(disease.count / analytics.total_analyses) * 100}%` }}
                       ></div>
                     </div>
                     <div className="text-right min-w-[4rem]">
                       <span className="text-sm font-medium text-axolotl dark:text-gray-400">
                         {disease.count}
                       </span>
                       <div className="text-xs text-gray-500 dark:text-gray-500">
                         {((disease.count / analytics.total_analyses) * 100).toFixed(1)}%
                       </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-hank text-pathlo dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-deer" />
              Confidence Distribution
            </h3>
            <div className="space-y-4">
                             {analytics?.confidence_distribution?.map((confidence, index) => {
                 const confidenceInfo = getConfidenceLevel(confidence.range);
                 return (
                   <div key={confidence.range} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className={`w-4 h-4 rounded-full ${confidenceInfo.bg}`}></div>
                       <span className="font-medium text-pathlo dark:text-white">{getConfidenceRangeLabel(confidence.range)}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                         <div 
                           className={`h-2 rounded-full ${confidenceInfo.bg.replace('bg-', 'bg-').replace('/20', '')}`}
                           style={{ width: `${(confidence.count / analytics.total_analyses) * 100}%` }}
                         ></div>
                       </div>
                       <div className="text-right min-w-[4rem]">
                         <span className="text-sm font-medium text-axolotl dark:text-gray-400">
                           {confidence.count}
                         </span>
                         <div className="text-xs text-gray-500 dark:text-gray-500">
                           {((confidence.count / analytics.total_analyses) * 100).toFixed(1)}%
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="text-xl font-hank text-pathlo dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-royalbrown" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {analytics?.recent_activity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getDiseaseBgColor(activity.predicted_class)}`}>
                    <Leaf className="w-5 h-5 text-pathlo dark:text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-pathlo dark:text-white">
                      {activity.predicted_class} detected
                    </p>
                    <p className="text-sm text-axolotl dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getConfidenceLevel(activity.confidence).color}`}>
                    {(activity.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-axolotl dark:text-gray-400">
                    {getConfidenceLevel(activity.confidence).level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-asparagus/10 to-deer/10 dark:from-asparagus/20 dark:to-deer/20 rounded-2xl p-8 border border-asparagus/20">
          <h3 className="text-2xl font-hank text-pathlo dark:text-white mb-6 text-center">
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-hank text-asparagus dark:text-asparagus mb-2">
                {analytics?.total_analyses ? Math.round((analytics.high_confidence_count / analytics.total_analyses) * 100) : 0}%
              </div>
              <p className="text-axolotl dark:text-gray-400">High Confidence Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-hank text-deer dark:text-deer mb-2">
                {analytics?.average_processing_time ? `${(analytics.average_processing_time * 1000).toFixed(0)}ms` : '0ms'}
              </div>
              <p className="text-axolotl dark:text-gray-400">Avg Processing Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-hank text-royalbrown dark:text-royalbrown mb-2">
                {analytics?.unique_diseases?.length || 0}
              </div>
              <p className="text-axolotl dark:text-gray-400">Disease Types Detected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 