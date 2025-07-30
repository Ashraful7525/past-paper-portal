import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  MessageCircle, 
  FileText, 
  ArrowUp,
  ArrowDown,
  Bookmark,
  ShieldCheck,
  X,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';
import { api } from '../../utils/api';

const NotificationCard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set empty state when API fails
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/auth/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // For demo purposes, still update locally
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/auth/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // For demo purposes, still update locally
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/auth/notifications/${notificationId}`);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // For demo purposes, still update locally
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 NOTIFICATION CLICKED - START');
    console.log('🔍 Notification type:', notification.type);
    console.log('🔍 Full notification object:', notification);
    
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    let navigationUrl = null;
    let highlightParams = null;

    console.log('� Processing notification type:', notification.type);

    switch (notification.type) {
      case 'solution_upvote':
      case 'solution_downvote':
        // For solution notifications, resolve to post and highlight solution
        if (notification.navigation_url?.startsWith('/solution/')) {
          const solutionId = notification.navigation_url.split('/')[2];
          try {
            const response = await api.get(`/auth/notifications/solution/${solutionId}/post`);
            navigationUrl = `/post/${response.data.post_id}`;
            highlightParams = `?highlight=solution&id=${solutionId}`;
          } catch (error) {
            console.error('Failed to resolve solution to post:', error);
            if (notification.related_post_id) {
              navigationUrl = `/post/${notification.related_post_id}`;
            }
          }
        }
        break;

      case 'comment_added':
      case 'comment_reply':
        console.log('📝 Processing comment notification...');
        console.log('🔍 Full notification object:', notification);
        
        // FORCE comment URL construction for testing
        if (notification.related_post_id) {
          // Try to find ANY field that might contain the comment ID
          const possibleCommentId = 
            notification.related_comment_id || 
            notification.comment_id || 
            notification.reference_id || // This should be the actual comment ID from schema
            notification.content_id ||
            notification.id; // Fallback to notification ID
            
          console.log('🔍 Possible comment ID sources:', {
            related_comment_id: notification.related_comment_id,
            comment_id: notification.comment_id,
            reference_id: notification.reference_id,
            content_id: notification.content_id,
            notification_id: notification.id,
            chosen: possibleCommentId
          });
          
          if (possibleCommentId) {
            navigationUrl = `/post/${notification.related_post_id}?highlight=comment&id=${possibleCommentId}`;
            highlightParams = null;
            console.log('✅ FORCED comment URL:', navigationUrl);
          } else {
            console.log('❌ No comment ID found, using post URL only');
            navigationUrl = `/post/${notification.related_post_id}`;
          }
        } else {
          console.log('❌ No related_post_id found');
        }
        break;

      case 'question_answer':
        // For new answer notifications, navigate to post and highlight the solution
        if (notification.related_solution_id) {
          navigationUrl = `/post/${notification.related_post_id}`;
          highlightParams = `?highlight=solution&id=${notification.related_solution_id}`;
        } else {
          navigationUrl = `/post/${notification.related_post_id}`;
        }
        break;

      case 'post_upvote':
      case 'post_downvote':
      case 'content_verified':
      default:
        console.log('🔍 DEFAULT CASE - Notification type:', notification.type);
        console.log('🔍 Using fallback navigation logic');
        
        // Check if it's any type of comment-related notification
        if (notification.type.includes('comment') || notification.message?.toLowerCase().includes('comment')) {
          console.log('💬 FALLBACK: Detected comment-related notification');
          if (notification.related_post_id) {
            const possibleCommentId = 
              notification.related_comment_id || 
              notification.comment_id || 
              notification.reference_id || // Check reference_id from schema
              notification.content_id ||
              notification.id;
              
            console.log('🔍 FALLBACK comment ID sources:', {
              related_comment_id: notification.related_comment_id,
              comment_id: notification.comment_id,
              reference_id: notification.reference_id,
              content_id: notification.content_id,
              notification_id: notification.id,
              chosen: possibleCommentId
            });
              
            if (possibleCommentId) {
              navigationUrl = `/post/${notification.related_post_id}?highlight=comment&id=${possibleCommentId}`;
              console.log('✅ FALLBACK comment URL:', navigationUrl);
            } else {
              navigationUrl = `/post/${notification.related_post_id}`;
            }
          }
        } else {
          // For post notifications, navigate directly
          if (notification.navigation_url) {
            navigationUrl = notification.navigation_url;
          } else if (notification.related_post_id) {
            navigationUrl = `/post/${notification.related_post_id}`;
          }
        }
        break;
    }

    // Navigate with highlighting parameters
    if (navigationUrl) {
      // If highlightParams is null, the URL is already complete
      const fullUrl = highlightParams ? `${navigationUrl}${highlightParams}` : navigationUrl;
      console.log('🎯 Navigating to:', fullUrl);
      console.log('🔍 URL parts:', { navigationUrl, highlightParams, fullUrl });
      navigate(fullUrl);
    } else {
      console.warn('⚠️ No navigation URL found for notification:', notification);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'solution_upvote':
      case 'question_upvote':
        return <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'solution_downvote':
      case 'question_downvote':
        return <ArrowDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
      case 'question_answer':
      case 'solution_added':
        return <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'comment_reply':
      case 'comment_added':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'post_verified':
        return <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
      case 'post_bookmarked':
        return <Bookmark className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getNotificationBg = (type, isRead) => {
    if (isRead) return 'bg-gray-50/50 dark:bg-gray-800/30';
    
    switch (type) {
      case 'solution_upvote':
      case 'question_upvote':
        return 'bg-emerald-50/80 dark:bg-emerald-900/20';
      case 'solution_downvote':
      case 'question_downvote':
        return 'bg-red-50/80 dark:bg-red-900/20';
      case 'question_answer':
      case 'solution_added':
        return 'bg-blue-50/80 dark:bg-blue-900/20';
      case 'comment_reply':
      case 'comment_added':
        return 'bg-purple-50/80 dark:bg-purple-900/20';
      case 'post_verified':
        return 'bg-green-50/80 dark:bg-green-900/20';
      case 'post_bookmarked':
        return 'bg-yellow-50/80 dark:bg-yellow-900/20';
      default:
        return 'bg-gray-50/80 dark:bg-gray-800/20';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 4);
  const hasMore = notifications.length > 4;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
          </div>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 h-12 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Compact Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group rounded-lg p-3 transition-all duration-200 hover:shadow-sm ${getNotificationBg(notification.type, notification.is_read)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute left-1 top-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* View post link */}
                    {notification.related_post_id && (
                      <Link
                        to={`/post/${notification.related_post_id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 font-medium"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show More/Less - Compact */}
      {hasMore && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-1"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show {notifications.length - 4} more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;