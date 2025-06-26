// Shared styling utilities following DRY principle

export const navigationStyles = {
  // Mobile navigation button styles
  mobile: {
    active: 'bg-blue-600 text-white hover:bg-blue-700',
    inactive: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  },
  // Desktop navigation button styles  
  desktop: {
    active: 'bg-primary text-primary-foreground',
    inactive: 'hover:bg-accent'
  },
  // Common navigation styles
  common: 'w-full justify-start text-left'
};

export const userProfileStyles = {
  // User avatar styles
  avatar: {
    mobile: 'h-8 w-8 mr-3',
    desktop: 'h-8 w-8 mr-3',
    fallback: 'text-xs bg-blue-100 text-blue-600'
  },
  // User info text styles
  userInfo: {
    name: 'text-sm font-medium truncate text-gray-900',
    email: 'text-xs text-gray-600 truncate'
  },
  // Profile button styles
  profileButton: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  logoutButton: 'text-red-600 hover:text-red-700 hover:bg-red-50'
};

export const containerStyles = {
  // Drawer/sidebar container styles
  drawer: {
    mobile: 'flex flex-col h-full bg-white text-gray-900',
    desktop: 'flex flex-col h-full'
  },
  // Header styles
  header: {
    mobile: 'flex items-center space-x-2 mb-6 flex-shrink-0 p-6 pb-0',
    desktop: 'flex items-center h-16 px-6 border-b flex-shrink-0'
  },
  // Navigation container styles
  navigation: {
    mobile: 'flex-1 overflow-y-auto px-3',
    desktop: 'flex-1 overflow-y-auto pt-5 pb-4'
  },
  // User profile section styles
  userSection: {
    mobile: 'flex-shrink-0 border-t border-gray-200 pt-4 mt-4 space-y-3 p-3',
    desktop: 'flex-shrink-0 border-t p-4 space-y-3'
  }
};

export const colorScheme = {
  // Primary brand colors
  primary: {
    main: 'text-blue-600',
    light: 'text-blue-500',
    dark: 'text-blue-700'
  },
  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600', 
    muted: 'text-gray-500'
  },
  // Background colors
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    accent: 'bg-gray-100'
  },
  // Border colors
  border: {
    light: 'border-gray-200',
    medium: 'border-gray-300'
  }
};

// Helper function to get navigation button classes
export const getNavigationButtonClass = (isActive, isMobile = false) => {
  const baseClass = navigationStyles.common;
  const platformStyles = isMobile ? navigationStyles.mobile : navigationStyles.desktop;
  const stateClass = isActive ? platformStyles.active : platformStyles.inactive;
  
  return `${baseClass} ${stateClass}`;
};

// Helper function to get user info classes
export const getUserInfoClasses = () => ({
  name: userProfileStyles.userInfo.name,
  email: userProfileStyles.userInfo.email,
  avatar: userProfileStyles.avatar.fallback,
  profile: userProfileStyles.profileButton,
  logout: userProfileStyles.logoutButton
});

// Helper function to get container classes
export const getContainerClass = (type, platform = 'desktop') => {
  return containerStyles[type]?.[platform] || '';
};