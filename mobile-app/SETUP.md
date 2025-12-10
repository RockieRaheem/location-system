# Quick Setup Guide

## Installation Steps

### 1. Install Dependencies
```powershell
cd mobile-app
npm install
```

### 2. Start Development Server
```powershell
npm start
```

### 3. Run on Your Device

#### Option A: Physical Device
1. Install "Expo Go" app from App Store/Play Store
2. Scan the QR code from the terminal

#### Option B: Simulator/Emulator
```powershell
# iOS (Mac only)
npm run ios

# Android
npm run android
```

## 📱 App Flow

1. **Login Screen** → Enter credentials (currently bypasses auth)
2. **Country List** → Select a country
3. **Admin Levels** → Browse hierarchical location data
4. **Admin Unit Editor** → Edit location details
5. **Version History** → View change history

## 🎨 All Screens Implemented

✅ Login Screen
✅ Country List Screen  
✅ Location Search Screen
✅ Admin Levels Screen (with expandable tree)
✅ Admin Unit Editor Screen
✅ Version History Screen (with timeline)

## 🎯 Current Status

**Frontend Complete**: All UI screens are fully designed and functional with mock data.

**Next Phase**: Backend integration with Firebase.

## 🔍 Testing the App

All screens are accessible through navigation:
- Start at Login
- Click "Login" button → Country List
- Click "Search" icon → Location Search
- Click any country → Admin Levels
- Click any expandable unit → Shows children
- Click leaf unit → Admin Unit Editor
- Click "View Version History" → Version History

## 📦 Mock Data Included

- 7 countries with flags
- Hierarchical admin units (Ghana example)
- 5 location search results
- 3 version history entries
- All level types (Region, District, Province, etc.)

## 🚀 Ready for Backend

The app structure is ready to integrate:
- Firebase Authentication
- Firestore for data storage
- Cloud Functions API
- Real-time updates

---

**All designs are complete and ready for backend connection!** 🎉
