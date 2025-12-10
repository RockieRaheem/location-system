# Location System Mobile App

A comprehensive React Native mobile application for managing country administrative units with hierarchical location data, built with Expo.

## 📱 Screens Overview

### 1. **Login Screen**
- Admin authentication with email/password
- Password visibility toggle
- Forgot password link
- Clean, centered design with branding

### 2. **Country List Screen**
- Browse all available countries with flags
- Search functionality in header
- Navigate to country-specific admin levels
- Country codes displayed for each entry

### 3. **Location Search Screen**
- Global search across all administrative units
- Filter by name, code, or type
- Visual icons for different location types
- Results displayed in card format

### 4. **Admin Levels Screen**
- Hierarchical view of administrative units
- Expandable/collapsible tree structure
- Country flag and name header
- Navigate to unit editor for modifications
- Visual indentation shows hierarchy depth

### 5. **Admin Unit Editor Screen**
- Edit administrative unit details
- Read-only unit ID field
- Editable name, parent ID, and level type
- Custom dropdown picker for level types
- View version history link
- Save/Cancel actions in sticky footer

### 6. **Version History Screen**
- Timeline view of all changes to a unit
- Shows old vs new values with visual badges
- Displays admin who made changes
- Timestamps for each modification
- Distinguishes between updates and creation

## 🏗️ Project Structure

```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── CountryListScreen.tsx
│   │   ├── LocationSearchScreen.tsx
│   │   ├── AdminLevelsScreen.tsx
│   │   ├── AdminUnitEditorScreen.tsx
│   │   ├── VersionHistoryScreen.tsx
│   │   └── index.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── index.ts
│   └── components/
│       └── LocationSelector.tsx (legacy)
├── App.tsx
├── package.json
└── tsconfig.json
```

## 🎨 Design System

### Colors
- **Primary**: `#135bec` (Blue)
- **Background Light**: `#f6f6f8`
- **Background Dark**: `#101622`
- **Gray Scale**: 50-900 shades
- **Danger**: `#DC2626` with light variant
- **Success**: `#16A34A` with light variant

### Typography
- **Font Family**: System fonts (Public Sans inspired)
- **Sizes**: xs (12px) → 3xl (30px)
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- **Rounded corners**: 8px (default), 12px (cards), 20px (circular)
- **Shadows**: Subtle elevation for cards and modals
- **Icons**: Material Icons from @expo/vector-icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. **Install dependencies**:
```bash
cd mobile-app
npm install
```

2. **Start the development server**:
```bash
npm start
```

3. **Run on platform**:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📦 Dependencies

### Core
- `expo`: ~48.0.0
- `react`: 18.2.0
- `react-native`: 0.71.8

### Navigation
- `@react-navigation/native`: ^6.1.9
- `@react-navigation/stack`: ^6.3.20
- `react-native-screens`: ~3.20.0
- `react-native-safe-area-context`: 4.5.0
- `react-native-gesture-handler`: ~2.9.0

### UI
- `@expo/vector-icons`: ^13.0.0

### Location Data
- `ug-locations`: ^1.0.0 (for Uganda data)

## 🔐 Authentication Flow

1. User enters credentials on Login Screen
2. On successful login, navigates to Country List
3. Each country leads to its Admin Levels hierarchy
4. Admin can edit units and view version history

## 📊 Data Structure

### Country
```typescript
{
  id: string;
  name: string;
  code: string;
  flagUrl: string;
}
```

### Admin Unit
```typescript
{
  id: string;
  name: string;
  type: string;
  icon: string;
  level: number;
  children?: AdminUnit[];
  expanded?: boolean;
}
```

### History Entry
```typescript
{
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  admin: string;
  type: 'update' | 'create';
}
```

## 🎯 Features

- ✅ Complete authentication UI
- ✅ Multi-country support with flags
- ✅ Hierarchical location browsing
- ✅ Expandable tree navigation
- ✅ Search functionality
- ✅ CRUD operations for admin units
- ✅ Version history tracking
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Material Design icons
- ✅ Smooth navigation transitions

## 🔄 Navigation Stack

```
Login
  └─> CountryList
        ├─> LocationSearch
        └─> AdminLevels
              └─> AdminUnitEditor
                    └─> VersionHistory
```

## 🎨 Screen States

### Interactive Elements
- **Touchable Opacity**: Buttons with 90% opacity on press
- **Expandable Lists**: Smooth transitions with rotate animations
- **Text Inputs**: Border color changes on focus
- **Selection States**: Background tint for selected items

### Visual Feedback
- Loading states (TODO: implement)
- Error messages (TODO: implement)
- Success confirmations (TODO: implement)
- Empty states (TODO: implement)

## 📝 Next Steps (Backend Integration)

1. **Firebase Authentication**
   - Connect Login screen to Firebase Auth
   - Implement session management
   - Add logout functionality

2. **Firestore Integration**
   - Fetch countries from Firestore
   - Load admin units hierarchy
   - Real-time updates for changes

3. **API Integration**
   - Connect to Cloud Functions API
   - Implement search with backend
   - CRUD operations with Firestore

4. **State Management**
   - Add Context API or Redux
   - Cache location data
   - Offline support

5. **Additional Features**
   - Pull-to-refresh
   - Infinite scroll/pagination
   - Image uploads for flags
   - Export/Import functionality

## 🧪 Testing

Currently, the app uses mock data for demonstration. All screens are fully functional with static data.

## 📱 Platform Support

- ✅ iOS (iPhone/iPad)
- ✅ Android (Phone/Tablet)
- ✅ Web (Responsive)

## 🎯 Design Fidelity

All screens are built to match the provided HTML/Tailwind designs with:
- Pixel-perfect spacing and sizing
- Exact color scheme implementation
- Matching typography and iconography
- Responsive layouts for different screen sizes

## 📄 License

MIT

---

**Built with ❤️ for the Location System Project**
