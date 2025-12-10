# Location System - Hierarchical Country Administration

A React Native mobile application for managing hierarchical administrative structures across countries worldwide.

## System Overview

This system allows administrators to:
- Register countries with custom administrative hierarchies
- Define formal and informal administrative levels
- Track electoral levels separately
- Associate countries with economic zones
- Maintain complete update history for auditing
- Manage administrative units at any level

## Key Features

### 1. Country Registration
Each country includes:
- **Name**: Official country name
- **Country Code**: ISO 3-letter code (e.g., UGA, USA)
- **Phone Code**: International dialing code (e.g., +256)
- **Flag**: Visual representation via flag CDN
- **Continent**: Geographic classification
- **Number of Administrative Levels**: Custom hierarchy depth
- **Number of Electoral Levels**: Separate electoral structure
- **Economic Zones**: Memberships (EAC, COMESA, EU, ASEAN, etc.)
- **Admin Level Names**: Custom names for each hierarchical level

### 2. Flexible Administrative Hierarchy

The system supports any administrative structure. Example for Uganda:

```
Level 1: Country (Uganda)
Level 2: Region (Central, Eastern, Western, Northern)
Level 3: Sub-region (Buganda, Busoga, Ankole, etc.)
Level 4: District/City (Kampala, Wakiso, Mukono, etc.)
Level 5: County/Constituency
Level 6: Sub-county/Division/Ward
Level 7: Parish
Level 8: Village/Cell
```

Each level can have:
- **Formal/Informal designation**: Government vs. customary structures
- **Electoral status**: Whether elections occur at this level
- **Parent-child relationships**: Hierarchical linkage
- **Custom metadata**: Flexible additional data (population, area, etc.)

### 3. Complete Update History

Every change is tracked with:
- Entity type (country, admin level, admin unit)
- Action performed (create, update, delete, activate, deactivate)
- Field-level changes (old value → new value)
- User who performed the action
- Timestamp
- Reason for change
- IP address (optional)

## Technical Architecture

### Frontend (React Native + Expo)
- **Navigation**: React Navigation (Stack Navigator)
- **UI Components**: Custom styled components with theme system
- **State Management**: React Hooks
- **Forms**: Controlled components with validation

### Backend (Firebase)
- **Firestore Collections**:
  - `countries`: Country registrations
  - `adminLevels`: Administrative level definitions per country
  - `adminUnits`: Actual administrative units (districts, parishes, etc.)
  - `updateHistory`: Complete audit trail
  
- **Authentication**: Firebase Auth
- **Real-time Updates**: Firestore listeners

### Data Models

#### Country
```typescript
{
  id: string
  name: string
  code: string // ISO 3-letter
  phoneCode: string // e.g., "+256"
  flagUrl: string
  continent: string
  numberOfAdminLevels: number
  numberOfElectoralLevels: number
  economicZones: string[] // ["EAC", "COMESA"]
  adminLevelNames: string[] // ["Country", "Region", ...]
  isConfigured: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}
```

#### AdminLevel
```typescript
{
  id: string
  countryId: string
  levelNumber: number // 1 = top level
  levelName: string // e.g., "District"
  isFormal: boolean // Government level vs informal
  isElectoral: boolean // Elections held at this level?
  parentLevelId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}
```

#### AdminUnit
```typescript
{
  id: string
  countryId: string
  levelId: string
  name: string
  code?: string
  parentUnitId?: string
  population?: number
  area?: number // km²
  metadata?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase project

### Installation

1. **Install dependencies**:
```bash
cd mobile-app
npm install
```

2. **Install Firebase packages**:
```bash
npm install firebase
```

3. **Configure Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config
   - Update `src/config/firebase.ts` with your credentials

4. **Run the app**:
```bash
npm start
```

5. **Open on device**:
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `w` for web version
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## Usage Flow

### For Administrators

1. **Login** → Access admin dashboard

2. **Select Country** → View all 195 countries with configuration status
   - 🟢 Configured: Has complete admin structure
   - 🟡 Setup Required: Needs configuration

3. **Configure Country** (if needed):
   - Enter basic info (name, codes, phone code)
   - Define number of admin levels
   - Define number of electoral levels
   - Name each administrative level
   - Select economic zone memberships
   - Save configuration

4. **Manage Admin Levels**:
   - View hierarchical structure
   - Add new administrative units
   - Edit existing units
   - Deactivate/reactivate units
   - View statistics per level

5. **View History**:
   - Complete audit trail
   - Filter by entity type
   - See who made changes and when
   - View field-level differences

## API Integration

The `locationService` provides methods for external integration:

```typescript
// Get all countries
await locationService.getAllCountries()

// Get country admin structure
await locationService.getAdminLevelsByCountry(countryId)

// Get units by level
await locationService.getAdminUnitsByLevel(countryId, levelId)

// Get hierarchical tree
await locationService.getAdminUnitHierarchy(countryId, parentUnitId)

// Update with history tracking
await locationService.updateAdminUnit(unitId, updates, userId, reason)

// Get statistics
await locationService.getCountryStats(countryId)
```

## Economic Zones Supported

- **EAC**: East African Community
- **COMESA**: Common Market for Eastern and Southern Africa
- **ECOWAS**: Economic Community of West African States
- **SADC**: Southern African Development Community
- **AU**: African Union
- **EU**: European Union
- **ASEAN**: Association of Southeast Asian Nations
- **MERCOSUR**: Southern Common Market
- **NAFTA**: North American Free Trade Agreement

## Security & Permissions

- Only authenticated admins can modify data
- All changes require user identification
- Optional reason for changes (for major updates)
- IP address logging available
- Complete audit trail prevents unauthorized changes

## Future Enhancements

- [ ] Bulk import from CSV/Excel
- [ ] GIS integration for mapping
- [ ] Population data integration
- [ ] Electoral district management
- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Advanced search and filtering
- [ ] Export reports (PDF, Excel)
- [ ] Role-based access control
- [ ] API rate limiting

## File Structure

```
mobile-app/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── types/
│   │   └── location.types.ts    # TypeScript interfaces
│   ├── services/
│   │   └── firebase/
│   │       └── locationService.ts  # API service layer
│   ├── screens/
│   │   ├── CountryListScreen.tsx      # Browse all countries
│   │   ├── CountryConfigScreen.tsx    # Configure country
│   │   ├── AdminLevelsScreen.tsx      # View hierarchy
│   │   ├── AdminUnitEditorScreen.tsx  # Edit units
│   │   └── VersionHistoryScreen.tsx   # Audit trail
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Navigation setup
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── scrollbar.ts
│   └── data/
│       └── countries.ts         # Country seed data
├── App.tsx
└── package.json
```

## Support

For issues or questions, please contact the development team.

---

**Built with React Native + Expo + Firebase**
