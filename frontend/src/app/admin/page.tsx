'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { Users, BookOpen, Award, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

interface AdminStats {
  total_users: number;
  new_users_30d: number;
  total_courses: number;
  active_learners: number;
  total_badges_earned: number;
  total_points_awarded: number;
  total_mentors: number;
  total_blog_posts: number;
}

interface RecentActivity {
  type: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/admin/stats');
      setStats(data.stats);
      setRecentActivity(data.recent_activity);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your BrowGen platform</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total_users || 0)}</p>
                <p className="text-sm text-green-600">+{stats?.new_users_30d || 0} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total_courses || 0)}</p>
                <p className="text-sm text-gray-500">{stats?.active_learners || 0} active learners</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total_badges_earned || 0)}</p>
                <p className="text-sm text-gray-500">{formatNumber(stats?.total_points_awarded || 0)} points total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total_blog_posts || 0)}</p>
                <p className="text-sm text-gray-500">{stats?.total_mentors || 0} mentors</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'signup' ? (
                          <Users className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.type === 'signup' ? (
                            <>
                              <span className="font-medium">{activity.user_name}</span> signed up
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{activity.user_name}</span> made progress in{' '}
                              <span className="font-medium">{activity.course_title}</span>
                            </>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <a
                    href="/admin/users"
                    className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3" />
                      Manage Users
                    </div>
                  </a>
                  
                  <a
                    href="/admin/courses"
                    className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3" />
                      Manage Courses
                    </div>
                  </a>
                  
                  <a
                    href="/admin/blog"
                    className="block w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-3" />
                      Manage Blog
                    </div>
                  </a>
                  
                  <a
                    href="/admin/mentors"
                    className="block w-full text-left px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3" />
                      Manage Mentors
                    </div>
                  </a>
                  
                  <a
                    href="/admin/analytics"
                    className="block w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-3" />
                      View Analytics
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
