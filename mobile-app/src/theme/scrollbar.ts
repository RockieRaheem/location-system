import { colors } from './colors';

export const scrollbarStyles = {
  // Scrollbar indicator style
  indicatorStyle: 'default' as const, // Can be 'default', 'black', 'white'
  
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
  
  // Show scrollbar config
  showsVerticalScrollIndicator: true,
  showsHorizontalScrollIndicator: false,
  
  // Smooth scrolling
  scrollEventThrottle: 16,
  decelerationRate: 'normal' as const,
  bounces: true,
  bouncesZoom: true,
};

export const getScrollbarProps = () => ({
  showsVerticalScrollIndicator: scrollbarStyles.showsVerticalScrollIndicator,
  showsHorizontalScrollIndicator: scrollbarStyles.showsHorizontalScrollIndicator,
  scrollEventThrottle: scrollbarStyles.scrollEventThrottle,
  decelerationRate: scrollbarStyles.decelerationRate,
  bounces: scrollbarStyles.bounces,
  indicatorStyle: scrollbarStyles.indicatorStyle,
});
