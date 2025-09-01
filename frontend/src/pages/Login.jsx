import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, Leaf, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    confirmPassword: '',
    name: '',
    first_name: '',
    last_name: '',
    username: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      if (!formData.usernameOrEmail) {
        newErrors.usernameOrEmail = 'Email or username is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.username) newErrors.username = 'Username is required';
      else if (!/^\w{3,30}$/.test(formData.username)) newErrors.username = 'Username must be 3-30 characters, letters, numbers, underscores only';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (isLogin) {
        const result = await login({ email: formData.usernameOrEmail, password: formData.password });
        if (result.success) {
          navigate('/');
        } else {
          setErrors({ general: result.error || 'Authentication failed. Please try again.' });
        }
      } else {
        const result = await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name
        });
        if (result.success) {
          navigate('/');
        } else {
          setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: isLogin ? 'Authentication failed. Please try again.' : 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-axolotl hover:text-pathlo dark:text-gray-400 dark:hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-xl">
                <img src="/logo-02.png" alt="PlanTech Logo" className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-hank text-pathlo dark:text-white mb-4">
                PlanTech
              </h1>
              <h2 className="text-2xl font-hank text-pathlo dark:text-white mb-3">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-lg text-axolotl dark:text-gray-400 font-helvetica">
                {isLogin ? 'Sign in to continue analyzing plants' : 'Join us to start your plant health journey'}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Registration fields */}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                            errors.first_name 
                              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                          } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                          placeholder="First name"
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                            errors.last_name 
                              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                          } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                          placeholder="Last name"
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                          errors.username 
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Choose a username"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Username or Email field */}
                <div>
                  <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      value={formData.usernameOrEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                        errors.usernameOrEmail 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Enter your email or username"
                    />
                  </div>
                  {errors.usernameOrEmail && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.usernameOrEmail}</p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                        errors.password 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password field (registration only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 ${
                          errors.confirmPassword 
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              {/* Toggle between login and register */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 font-helvetica">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setFormData({ usernameOrEmail: '', password: '', confirmPassword: '', name: '', first_name: '', last_name: '', username: '', email: '' });
                    }}
                    className="text-asparagus hover:text-axolotl font-semibold transition-colors duration-300"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:block">
            <div className="text-center">
              <h2 className="text-3xl font-hank text-pathlo dark:text-white mb-8">
                Why Choose PlanTech?
              </h2>
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">AI-Powered Detection</h3>
                  <p className="text-axolotl dark:text-gray-400">
                    Advanced machine learning for 99.8% accuracy in plant disease identification
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">Lightning Fast</h3>
                  <p className="text-axolotl dark:text-gray-400">
                    Get results in under 5 seconds with our optimized AI engine
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-hank text-pathlo dark:text-white mb-2">Enterprise Security</h3>
                  <p className="text-axolotl dark:text-gray-400">
                    Military-grade encryption and complete data privacy protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 