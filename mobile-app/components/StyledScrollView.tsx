import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { getScrollbarProps, scrollbarStyles } from '../src/theme';

interface StyledScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  showScrollbar?: boolean;
}

export const StyledScrollView: React.FC<StyledScrollViewProps> = ({
  children,
  showScrollbar = true,
  style,
  contentContainerStyle,
  ...props
}) => {
  const scrollbarProps = showScrollbar ? getScrollbarProps() : {
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
  };

  // For web, ensure the style includes overflow
  const webStyle = Platform.OS === 'web' ? {
    overflowY: 'scroll',
    overflowX: 'hidden',
  } : {};

  return (
    <ScrollView
      style={[styles.scrollView, webStyle, style] as any}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      {...scrollbarProps}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingRight: Platform.OS === 'android' ? 4 : 0,
  },
});
