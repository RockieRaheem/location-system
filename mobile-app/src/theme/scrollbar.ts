import { colors } from './colors';
import { Platform } from 'react-native';

export const scrollbarStyles = {
  // Scrollbar indicator style - 'black' makes it more visible
  indicatorStyle: (Platform.OS === 'ios' ? 'black' : 'default') as 'black' | 'white' | 'default',
  
  // Custom scrollbar colors
  scrollbar: {
    track: colors.gray[100],
    thumb: colors.gray[400],
    thumbHover: colors.gray[500],
    thumbActive: colors.primary,
  },
  
  // Scrollbar dimensions
  dimensions: {
    width: 6,
    borderRadius: 3,
  },
  
  // FlatList/ScrollView props for consistent styling
  contentContainerStyle: {
    paddingRight: 8, // Space for scrollbar
  },
  
  // Show scrollbar config - always show on Android, flash on iOS
  showsVerticalScrollIndicator: true,
  showsHorizontalScrollIndicator: false,
  
  // Smooth scrolling
  scrollEventThrottle: 16,
  decelerationRate: 'normal' as 'normal' | 'fast',
  bounces: true,
  bouncesZoom: true,
  
  // Make scrollbar persist longer on iOS
  scrollIndicatorInsets: { right: 1 },
};

export const getScrollbarProps = () => ({
  showsVerticalScrollIndicator: scrollbarStyles.showsVerticalScrollIndicator,
  showsHorizontalScrollIndicator: scrollbarStyles.showsHorizontalScrollIndicator,
  scrollEventThrottle: scrollbarStyles.scrollEventThrottle,
  decelerationRate: scrollbarStyles.decelerationRate,
  bounces: scrollbarStyles.bounces,
  indicatorStyle: scrollbarStyles.indicatorStyle,
  scrollIndicatorInsets: scrollbarStyles.scrollIndicatorInsets,
});
