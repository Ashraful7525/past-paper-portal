import React from 'react';

const ProfilePicture = ({ 
  user, 
  size = 'md', 
  className = '',
  showOnlineStatus = false,
  onClick = null 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-28 h-28 text-3xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  const baseClasses = `${sizeClass} rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-200 ${className}`;
  
  const handleClick = onClick ? { onClick, className: `${baseClasses} cursor-pointer hover:shadow-md` } : { className: baseClasses };

  if (user?.profile_picture_url) {
    return (
      <div className="relative inline-block">
        <img
          src={user.profile_picture_url}
          alt={`${user.username || user.author_username || 'User'}'s profile`}
          {...handleClick}
          className={`${handleClick.className} object-cover`}
        />
        {showOnlineStatus && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
        )}
      </div>
    );
  }

  // Fallback to initials
  const username = user?.username || user?.author_username || 'U';
  const initial = username.charAt(0).toUpperCase();
  
  return (
    <div className="relative inline-block">
      <div
        {...handleClick}
        className={`${handleClick.className} bg-gradient-to-br from-blue-500 to-indigo-600 text-white`}
      >
        {initial}
      </div>
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
      )}
    </div>
  );
};

export default ProfilePicture;