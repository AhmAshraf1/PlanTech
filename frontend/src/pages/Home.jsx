import { Link } from 'react-router-dom';
import { UploadCloud, History, Leaf, Shield, Zap, TrendingUp, Users, Clock, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-center animate-fade-in relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-asparagus rounded-full"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-deer rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-24 h-24 border-4 border-royalbrown rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-asparagus rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-8 h-8 border-2 border-deer rounded-full"></div>
        <div className="absolute top-1/3 right-10 w-6 h-6 bg-royalbrown rounded-full"></div>
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-axolotl rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-pathlo rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-20">
          <div className="flex justify-center mb-8">
            <img 
              src="/logo-01.png" 
              alt="PlanTech Logo" 
              className="w64 h-64 object-contain drop-shadow-2xl" 
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-hank text-pathlo dark:text-white mb-8 tracking-tight drop-shadow-sm">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-asparagus to-deer">PlanTech</span>
          </h1>
          <p className="text-2xl md:text-3xl font-helvetica text-axolotl dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered plant disease detection with real-time analysis and comprehensive insights
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl px-8 py-4 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">99.8% Accuracy</span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">&lt;50ms Analysis</span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-300">Trusted by Farmers and Gardeners</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 mb-20 justify-center">
          <Link
            to="/upload"
            className="group bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer text-white font-semibold py-6 px-12 rounded-3xl text-xl shadow-2xl transition-all duration-300 inline-flex items-center gap-4 hover:scale-105 hover:shadow-3xl"
          >
            <UploadCloud className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" /> 
            Start Analysis
          </Link>
          <Link
            to="/analytics"
            className="group bg-gradient-to-r from-pathlo to-axolotl hover:from-axolotl hover:to-pathlo text-white font-semibold py-6 px-12 rounded-3xl text-xl shadow-2xl transition-all duration-300 inline-flex items-center gap-4 hover:scale-105 hover:shadow-3xl"
          >
            <TrendingUp className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" /> 
            View Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-20 mx-auto">
          <div className="group bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-xl flex flex-col items-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-hank text-2xl text-pathlo dark:text-white mb-4">AI-Powered Detection</h3>
            <p className="text-base text-axolotl dark:text-gray-400 font-helvetica text-center leading-relaxed">
              State-of-the-art machine learning model trained on millions of plant images for accurate disease recognition and detailed analysis.
            </p>
          </div>
          
          <div className="group bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-xl flex flex-col items-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-hank text-2xl text-pathlo dark:text-white mb-4">Lightning Fast</h3>
            <p className="text-base text-axolotl dark:text-gray-400 font-helvetica text-center leading-relaxed">
              Get instant results with our optimized AI engine. Upload multiple images and receive comprehensive analysis in seconds.
            </p>
          </div>
          
          <div className="group bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-xl flex flex-col items-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-hank text-2xl text-pathlo dark:text-white mb-4">Enterprise Security</h3>
            <p className="text-base text-axolotl dark:text-gray-400 font-helvetica text-center leading-relaxed">
              Military-grade encryption and secure processing. Your images are never stored permanently and are completely private.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-asparagus to-deer rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-hank text-lg text-pathlo dark:text-white mb-2">Upload Image</h3>
              <p className="text-sm text-axolotl dark:text-gray-400">Simply drag & drop or click to upload your plant image</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-deer to-royalbrown rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-hank text-lg text-pathlo dark:text-white mb-2">AI Analysis</h3>
              <p className="text-sm text-axolotl dark:text-gray-400">Our AI processes the image in real-time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-royalbrown to-axolotl rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-hank text-lg text-pathlo dark:text-white mb-2">Get Results</h3>
              <p className="text-sm text-axolotl dark:text-gray-400">Receive detailed disease detection with confidence scores</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-axolotl to-pathlo rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="font-hank text-lg text-pathlo dark:text-white mb-2">Track Progress</h3>
              <p className="text-sm text-axolotl dark:text-gray-400">Monitor your plant health over time</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-asparagus/10 to-deer/10 dark:from-asparagus/20 dark:to-deer/20 rounded-3xl p-12 mb-20 border border-asparagus/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-hank text-pathlo dark:text-white mb-6">
              Ready to Protect Your Plants?
            </h2>
            <p className="text-lg text-axolotl dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of gardeners, farmers, and plant enthusiasts who trust PlanTech for accurate disease detection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="bg-gradient-to-r from-deer to-royalbrown text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center gap-3"
              >
                <UploadCloud className="w-5 h-5" />
                Start Free Analysis
              </Link>
              <Link
                to="/history"
                className="bg-white/90 dark:bg-gray-800/90 text-pathlo dark:text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center gap-3 border border-gray-200 dark:border-gray-600"
              >
                <History className="w-5 h-5" />
                View History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}