import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import apiService from '../services/api';
import {
  User,
  Mail,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Leaf,
  Zap,
  ArrowLeft,
  Link as LinkIcon,
  Bell,
  Globe,
  Palette
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { success, error } = useNotifications();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [settings, setSettings] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || ''
      });
      loadUserStats();
      loadUserSettings();
    }
    // eslint-disable-next-line
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await apiService.getAnalytics();
      setUserStats(response);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const loadUserSettings = async () => {
    try {
      const response = await apiService.getSettings();
      setSettings(response);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      success('Profile Updated', 'Profile updated successfully!');
    } catch (err) {
      error('Update Failed', err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      error('Password Error', 'New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      error('Password Error', 'Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      success('Password Changed', 'Password changed successfully!');
    } catch (err) {
      error('Password Change Failed', err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      await apiService.updateSettings(newSettings);
      setSettings(newSettings);
      success('Settings Updated', 'Settings updated successfully!');
    } catch (err) {
      error('Settings Update Failed', err.message || 'Failed to update settings');
    }
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await apiService.request('/auth/profile', { method: 'DELETE' });
      success('Account Deleted', 'Account deleted successfully');
      logout();
    } catch (err) {
      error('Account Deletion Failed', err.message || 'Failed to delete account');
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await apiService.exportHistory('csv');
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantech_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Data Exported', 'Data exported successfully!');
    } catch (err) {
      error('Export Failed', 'Failed to export data');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'statistics', name: 'Statistics', icon: BarChart3, color: 'from-green-500 to-green-600' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'from-purple-500 to-purple-600' },
    { id: 'security', name: 'Security', icon: Shield, color: 'from-orange-500 to-orange-600' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-xl">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-axolotl dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-axolotl hover:text-pathlo dark:text-gray-400 dark:hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-hank text-pathlo dark:text-white mb-4">
              Your Profile
            </h1>
            <p className="text-xl font-helvetica text-axolotl dark:text-gray-400 max-w-3xl mx-auto">
              Manage your account settings, view statistics, and customize your PlanTech experience
            </p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 mb-12 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-asparagus to-deer rounded-full flex items-center justify-center shadow-xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg border border-gray-200 dark:border-gray-600">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-hank text-pathlo dark:text-white mb-2">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-lg text-axolotl dark:text-gray-400 mb-4">@{user.username}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap justify-center lg:justify-start space-x-1 lg:space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg ${
                      activeTab === tab.id
                        ? `border-${tab.color.split('-')[1]}-500 text-${tab.color.split('-')[1]}-600 dark:text-${tab.color.split('-')[1]}-400 bg-${tab.color.split('-')[1]}-50 dark:bg-${tab.color.split('-')[1]}-900/20`
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-hank text-pathlo dark:text-white">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 text-sm font-medium text-asparagus hover:text-deer bg-asparagus/10 hover:bg-asparagus/20 rounded-xl transition-all duration-300"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-asparagus to-deer hover:from-deer hover:to-asparagus rounded-xl focus:outline-none focus:ring-2 focus:ring-asparagus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-hank text-pathlo dark:text-white">Your Activity Statistics</h3>

                {userStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Predictions</p>
                          <p className="text-3xl font-bold">{userStats.total_predictions || 0}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">High Confidence</p>
                          <p className="text-3xl font-bold">{userStats.high_confidence_predictions || 0}</p>
                        </div>
                        <Leaf className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Avg Confidence</p>
                          <p className="text-3xl font-bold">{((userStats.average_confidence || 0) * 100).toFixed(1)}%</p>
                        </div>
                        <Zap className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm font-medium">Diseases Found</p>
                          <p className="text-3xl font-bold">{userStats.unique_diseases || 0}</p>
                        </div>
                        <Shield className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <BarChart3 className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-400">No statistics available yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start analyzing plants to see your statistics!</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-hank text-pathlo dark:text-white">Preferences</h3>

                {settings && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Theme
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => handleSettingsUpdate({ ...settings, theme: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Language
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingsUpdate({ ...settings, language: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Notifications
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive email notifications for analysis results
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingsUpdate({ ...settings, email_notifications: !settings.email_notifications })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.email_notifications ? 'bg-asparagus' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Push Notifications
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive push notifications in your browser
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingsUpdate({ ...settings, push_notifications: !settings.push_notifications })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.push_notifications ? 'bg-asparagus' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-hank text-pathlo dark:text-white">Security Settings</h3>

                {/* Change Password */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8">
                  <h4 className="text-xl font-hank text-pathlo dark:text-white mb-6 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-asparagus" />
                    Change Password
                  </h4>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-asparagus focus:border-transparent transition-all duration-300 dark:bg-gray-700 dark:text-white"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-asparagus to-deer hover:from-deer hover:to-asparagus rounded-xl focus:outline-none focus:ring-2 focus:ring-asparagus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                    >
                      {isLoading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Data Export */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8">
                  <h4 className="text-xl font-hank text-pathlo dark:text-white mb-4 flex items-center gap-3">
                    <Download className="w-5 h-5 text-asparagus" />
                    Data Export
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Download all your analysis data and history
                  </p>
                  <button
                    onClick={handleDataExport}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                  <h4 className="text-xl font-hank text-red-900 dark:text-red-100 mb-4 flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    Danger Zone
                  </h4>
                  <p className="text-red-700 dark:text-red-300 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleAccountDeletion}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 