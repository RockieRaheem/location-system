import React from 'react';
import {
  FlatList,
  FlatListProps,
  StyleSheet,
  Platform,
} from 'react-native';
import { getScrollbarProps } from '../src/theme';

interface StyledFlatListProps<T> extends FlatListProps<T> {
  showScrollbar?: boolean;
}

export function StyledFlatList<T>({
  showScrollbar = true,
  style,
  contentContainerStyle,
  horizontal,
  ...props
}: StyledFlatListProps<T>) {
  // Get scrollbar props but adjust for horizontal lists
  const baseScrollbarProps = getScrollbarProps();
  const scrollbarProps = showScrollbar ? {
    showsVerticalScrollIndicator: !horizontal,
    showsHorizontalScrollIndicator: horizontal ? true : false,
    scrollEventThrottle: baseScrollbarProps.scrollEventThrottle,
    decelerationRate: baseScrollbarProps.decelerationRate,
    bounces: baseScrollbarProps.bounces,
    indicatorStyle: baseScrollbarProps.indicatorStyle,
    scrollIndicatorInsets: baseScrollbarProps.scrollIndicatorInsets,
  } : {
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
  };

  // For web, ensure the style includes overflow
  const webStyle = Platform.OS === 'web' ? {
    overflowY: !horizontal ? 'scroll' : 'visible',
    overflowX: horizontal ? 'scroll' : 'visible',
  } : {};

  return (
    <FlatList
      horizontal={horizontal}
      style={[styles.flatList, webStyle, style] as any}
      contentContainerStyle={[
        !horizontal && styles.contentContainer,
        contentContainerStyle,
      ]}
      {...scrollbarProps}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingRight: Platform.OS === 'android' ? 4 : 0,
  },
});
