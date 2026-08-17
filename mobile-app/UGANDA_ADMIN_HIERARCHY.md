# Uganda Administrative Hierarchy - System Documentation

## 📋 OFFICIAL ADMINISTRATIVE STRUCTURE

Uganda's administrative system is defined by the **Electoral Commission of Uganda (ECU)** and follows the structure established in the 2022 administrative divisions audit.

### Hierarchical Levels

| Level | Name | Count | Description |
|-------|------|-------|-------------|
| 1 | **Country** | 1 | Uganda (Whole nation) |
| 2 | **Region** | 4 | Major geographical/administrative regions |
| 3 | **Sub-region** | 15 | Cultural and administrative sub-regions |
| 4 | **District/City** | 121 | Primary administrative divisions |
| 5 | **County/Constituency** | 167 + 1 City Council + 13 Municipalities | Electoral boundaries |
| 6 | **Sub-county/Division/Ward** | ~600+ | Administrative sub-divisions |
| 7 | **Parish/Ward** | ~2,500+ | Electoral/administrative units for local councils |
| 8 | **Village/Cell** | 55,000+ | Grassroots community units |

### Key Facts

- **Total Districts**: 121 (verified Electoral Commission 2022)
- **Total Villages**: 55,000+ villages in comprehensive dataset
- **Data Source**: Electoral Commission Uganda, Uganda Bureau of Statistics
- **Last Major Update**: 2022 Census

### 4-Level Simplified Hierarchy (System Default)

For practical administration and our system implementation, we use a simplified 4-level structure:

```
District (Primary administrative unit)
  ├── Constituency (Electoral boundary - for Parliament)
  └── Subcounty/Division (Administrative subdivision)
      └── Parish/Ward (Local council electoral unit)
          └── Village/Cell (Grassroots community)
```

---

## 🇺🇬 UGANDA FLAG - OFFICIAL SPECIFICATIONS

### Legal Framework
- **Legislation**: National Flag and Armorial Ensigns Act (1962)
- **Adoption Date**: October 9, 1962 (Independence)
- **Designer**: Grace Ibingira (Chair of Cabinet subcommittee)

### Visual Design

#### Six Equal Horizontal Bands
```
┌─────────────────────────┐
│  BLACK   (#000000)      │  = Ugandan People
├─────────────────────────┤
│  YELLOW  (#FCDC04)      │  = Sunshine
├─────────────────────────┤
│  RED     (#D90000)      │  = Brotherhood
├─────────────────────────┤
│  BLACK   (#000000)      │  = Ugandan People
├─────────────────────────┤
│  YELLOW  (#FCDC04)      │  = Sunshine
├─────────────────────────┤
│  RED     (#D90000)      │  = Brotherhood
└─────────────────────────┘
```

#### Central Charge
- **White Disc** (circular background)
- **Grey Crowned Crested Crane** (Balearica regulorum gibbericeps) centered
  - **National Bird**: National symbol of Uganda
  - **Symbolism**: Good fortune, longevity, wealth (Baganda culture)
  - **Color**: Natural grey plumage
  - **Crown**: Distinctive golden tuft (key identifying feature)

### Technical Specifications
- **Aspect Ratio**: 2:3 (width:height)
- **Color Codes**:
  - Black: `#000000`
  - Yellow: `#FCDC04`
  - Red: `#D90000`
  - White (disc): `#FFFFFF`
- **Disc Size**: Approximately 1/3 of flag height

### Legal Protection
- Commercial use requires permission from Minister of Justice & Constitutional Affairs
- Misuse is punishable by up to 2 years imprisonment
- Disrespect (verbal, written, or action) is a criminal offense

---

## 🏛️ TRADITIONAL KINGDOMS (Parallel System)

Five Bantu kingdoms maintain cultural autonomy alongside government administration:

1. **Buganda** (Largest - Kampala region)
2. **Bunyoro** (Western region)
3. **Toro** (Southwest region)
4. **Busoga** (Eastern region)
5. **Rwenzururu** (Established 2008 - Southwest region)

These kingdoms follow electoral boundaries for administrative purposes while maintaining cultural institutions.

---

## 📊 CURRENT SYSTEM CONFIGURATION

### Web App
- **Framework**: Vite + React + TypeScript
- **Flag Display**: SVG with crested crane (local: `/public/uganda-flag.svg`)
- **UI**: Map-first interface (OpenLayers)
- **Admin Interface**: District → Subcounty → Parish → Village

### Mobile App
- **Framework**: React Native + Expo
- **Flag Display**: Official Wikimedia Commons image
- **8 Screens**: Login, Country List, Location Search, Admin Levels, Admin Unit Editor, Version History, Admin Dashboard, Read-Only View
- **Navigation**: Stack Navigator

### Backend
- **Firebase Firestore Collections**:
  - `countries` - Country registrations
  - `admin_levels` - Hierarchical level definitions
  - `admin_units` - Actual administrative divisions
  - `audits` - Complete change tracking

### Data Pipeline
- **Import Source**: Electoral Commission CSV data
- **Data Package**: `ug-locations` (NPM package)
- **Coverage**: All 135 districts with 55,000+ villages
- **Search**: O(1) village lookup via optimized JSON

---

## 📈 HIERARCHY STRUCTURE IN CODE

### CountryConfig (Web App)
```typescript
{
  id: "ug",
  iso2: "UG",
  name: "Uganda",
  flagColors: { primary: "#000000", secondary: "#FCDC04", accent: "#D90000" },
  dataSource: "Electoral Commission Uganda administrative units (July 2022)",
  dataYear: 2022,
  levels: [
    { number: 1, name: "district", plural: "districts", label: "District" },
    { number: 2, name: "subcounty", plural: "subcounties", label: "Subcounty" },
    { number: 3, name: "parish", plural: "parishes", label: "Parish" },
    { number: 4, name: "village", plural: "villages", label: "Village" },
  ],
  map: { center: [1.3733, 32.2903], zoom: 7 }
}
```

### Country Model (Mobile App)
```typescript
{
  id: 'UG',
  name: 'Uganda',
  code: 'UGA',
  flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/320px-Flag_of_Uganda.svg.png',
  continent: 'Africa',
  phoneCode: '+256',
  numberOfAdminLevels: 8,
  numberOfElectoralLevels: 5,
  economicZones: ['EAC', 'COMESA'],
  adminLevelNames: ['Country', 'Region', 'Sub-region', 'District/City', 'County/Constituency', 'Sub-county/Division/Ward', 'Parish', 'Village/Cell'],
  isConfigured: true
}
```

---

## 🔄 ADMIN OPERATIONS WORKFLOW

### Adding a New District
1. Admin logs in via mobile/web app
2. Navigate to "Admin Levels" or "Add District"
3. Enter district details (name, code, parent region)
4. System creates:
   - AdminUnit record with level=1 (district)
   - UpdateHistory entry (action: "create")
   - Audit log entry
5. Flag is persisted for future breakdowns

### Breaking Down a District into Subcounties
1. Select existing district
2. Click "Add Subcounty"
3. Enter subcounty details
4. System maintains parent-child relationship
5. Full audit trail recorded

### Supporting Further Subdivisions
1. Subcounty → Parishes
2. Parishes → Villages
3. System supports unlimited depth via `parentUnitId` field

---

## 💰 BUDGET ALLOCATION INTEGRATION

### Current Status
- System architecture supports `metadata` field on AdminUnit
- Can store: `{ population: number, area: number, budget: number, ...any }`

### Implementation Path
1. Add budget field to AdminUnit model
2. Create budget hierarchy rules:
   - Parent budget allocation proportional to children
   - Validation: sum of children ≤ parent budget
3. Add budget visualization:
   - Web: Budget chart per level
   - Mobile: Budget breakdown screen
4. Track budget modifications in audit trail

---

## 🌍 SUPPORTED REGIONS & ECONOMIC ZONES

### Economic Zones
- **EAC** (East African Community)
- **COMESA** (Common Market for Eastern and Southern Africa)
- **AU** (African Union)

### 15 Sub-regions Supported
Acholi, Ankole, Buganda, Bugisu, Bukedi, Bunyoro, Busoga, Elgon, Karamoja, Kigezi, Lango, Rwenzori, Sebei, Teso, West Nile

---

## 📚 DATA SOURCES & REFERENCES

### Official Sources
1. **Electoral Commission of Uganda**: www.ec.or.ug
2. **Uganda Bureau of Statistics**: www.ubos.go.ug
3. **Uganda Local Governments Association**: ULGA

### Legal References
- National Flag and Armorial Ensigns Act (1962)
- Uganda Constitution (1995, as amended)
- Local Government Act (1997)

### Technical Data
- Wikipedia: Administrative divisions of Uganda
- Wikimedia Commons: Flag of Uganda (official SVG)
- ug-locations NPM package (55,000+ villages dataset)

---

## ✅ System Ready For

✓ Adding new districts dynamically  
✓ Breaking existing districts into subcounties/parishes  
✓ Moving units between hierarchies  
✓ Complete audit trail tracking  
✓ Budget allocation (infrastructure ready)  
✓ Multi-country expansion  
✓ Electoral boundary management  
✓ Version history and rollback  
