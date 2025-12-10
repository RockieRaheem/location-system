# Scrollbar System Guide

## Overview
The mobile app now features a consistent, nicely-styled scrollbar system throughout all screens. This ensures better UX by making scrollable content clearly visible and accessible.

## Components

### 1. **StyledScrollView**
Located: `components/StyledScrollView.tsx`

A wrapper around React Native's `ScrollView` with enhanced scrollbar visibility and styling.

**Usage:**
```tsx
import { StyledScrollView } from '../../components/StyledScrollView';

<StyledScrollView contentContainerStyle={styles.content}>
  {/* Your content */}
</StyledScrollView>
```

**Props:**
- All standard `ScrollView` props
- `showScrollbar?: boolean` - Toggle scrollbar visibility (default: true)

### 2. **StyledFlatList**
Located: `components/StyledFlatList.tsx`

A wrapper around React Native's `FlatList` with enhanced scrollbar visibility and styling.

**Usage:**
```tsx
import { StyledFlatList } from '../../components/StyledFlatList';

<StyledFlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
/>
```

**Props:**
- All standard `FlatList` props
- `showScrollbar?: boolean` - Toggle scrollbar visibility (default: true)
- Automatically adjusts scrollbar orientation for horizontal lists

## Theme Configuration

### Scrollbar Settings
Located: `src/theme/scrollbar.ts`

**Key Features:**
- **Indicator Style**: Black on iOS for better visibility, default on Android
- **Always Visible**: Scrollbars are configured to be visible during scrolling
- **Smooth Scrolling**: Optimized scroll event throttling (16ms)
- **Platform-Optimized**: Different behaviors for iOS vs Android

**Configuration Options:**
```typescript
export const scrollbarStyles = {
  indicatorStyle: 'black' | 'white' | 'default',
  showsVerticalScrollIndicator: true,
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 16,
  decelerationRate: 'normal',
  bounces: true,
  scrollIndicatorInsets: { right: 1 },
}
```

## Implementation Across Screens

### Updated Screens:
1. ✅ **AdminLevelsScreen** - Country administrative levels list
2. ✅ **AdminUnitEditorScreen** - Form scrolling
3. ✅ **CountryListScreen** - Countries list
4. ✅ **LocationSearchScreen** - Search results list
5. ✅ **VersionHistoryScreen** - History timeline
6. ✅ **LocationSelector** - District, subcounty, and search lists

## Scrollbar Behavior

### iOS
- Scrollbar appears during scrolling
- Black indicator for better visibility
- Subtle fade-out after scrolling stops
- Smooth momentum scrolling with bounce

### Android
- Scrollbar more persistently visible
- Native Android scrollbar styling
- Consistent with platform conventions

### Web (Expo/Browser)
- **Always visible** custom styled scrollbars
- Wider track (10px) for better visibility
- Gray color scheme matching the app theme
- Hover effects on scrollbar thumb
- Active state changes to primary blue color
- CSS-based styling via `scrollbar.web.css`
- Automatically imported when running on web platform

## Best Practices

### When to Use StyledScrollView
- Form pages with multiple inputs
- Long content that requires vertical scrolling
- Detail pages with mixed content types

### When to Use StyledFlatList
- Lists of items (dynamic data)
- Virtualized rendering for performance
- Uniform item rendering

### Horizontal Scrolling
For horizontal lists, simply pass `horizontal` prop:
```tsx
<StyledFlatList
  horizontal
  data={items}
  renderItem={renderItem}
  showScrollbar={false} // Optional: hide for horizontal lists
/>
```

## Customization

### To Modify Scrollbar Appearance:
1. Edit `src/theme/scrollbar.ts`
2. Adjust `indicatorStyle`, colors, or dimensions
3. Changes apply globally across all screens

### To Hide Scrollbars on Specific Components:
```tsx
<StyledFlatList
  data={items}
  renderItem={renderItem}
  showScrollbar={false}
/>
```

## Accessibility
- Scrollbars provide visual feedback for scrollable content
- Helps users understand content length
- Platform-native behavior maintains familiar UX

## Performance
- Scroll event throttling prevents excessive renders
- FlatList virtualization maintains performance with large lists
- Optimized for 60fps scrolling experience
