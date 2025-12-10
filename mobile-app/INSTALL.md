# Installation Commands

## Quick Start Commands

### 1. Navigate to Mobile App Directory
```powershell
cd c:\Users\Raheem\Desktop\location-system\mobile-app
```

### 2. Install Dependencies
```powershell
npm install
```

This will install all required packages:
- expo (~48.0.0)
- react (18.2.0)
- react-native (0.71.8)
- @react-navigation/native (^6.1.9)
- @react-navigation/stack (^6.3.20)
- react-native-screens (~3.20.0)
- react-native-safe-area-context (4.5.0)
- react-native-gesture-handler (~2.9.0)
- @expo/vector-icons (^13.0.0)
- ug-locations (^1.0.0)
- typescript (^4.9.5)
- @types/react (~18.2.14)
- @types/react-native (~0.71.6)

### 3. Start Development Server
```powershell
npm start
```

This opens the Expo Dev Tools in your browser.

### 4. Run on Platform

**Option A: Physical Device**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal or browser

**Option B: iOS Simulator (Mac only)**
```powershell
npm run ios
```

**Option C: Android Emulator**
```powershell
npm run android
```

**Option D: Web Browser**
```powershell
npm run web
```

---

## Troubleshooting

### If npm install fails:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

### If Expo won't start:
```powershell
# Install Expo CLI globally
npm install -g expo-cli

# Try starting again
npm start
```

### If Metro bundler has issues:
```powershell
# Clear Metro cache
npm start -- --clear
```

---

## System Requirements

### Windows
- Node.js 16+ (check with `node --version`)
- npm 7+ (check with `npm --version`)
- Git (optional, for version control)

### For Android Development
- Android Studio with Android SDK
- Android Emulator or physical device

### For iOS Development (Mac only)
- macOS with Xcode
- iOS Simulator or physical device

---

## Verification

After installation, verify with:

```powershell
# Check Node version
node --version
# Should show v16.x.x or higher

# Check npm version
npm --version
# Should show 7.x.x or higher

# Check Expo CLI (if installed globally)
expo --version
```

---

## Next Steps After Installation

1. ✅ Run `npm start`
2. ✅ Scan QR code with Expo Go app OR run on simulator
3. ✅ See Login screen
4. ✅ Test navigation through all 6 screens
5. ✅ Explore the UI and interactions

---

## All 6 Screens Available

After installation, you can navigate through:

1. **Login Screen** (initial screen)
2. **Country List Screen** (after login)
3. **Location Search Screen** (via search icon)
4. **Admin Levels Screen** (via country selection)
5. **Admin Unit Editor Screen** (via unit selection)
6. **Version History Screen** (via "View History" link)

---

**Ready to run!** 🚀
