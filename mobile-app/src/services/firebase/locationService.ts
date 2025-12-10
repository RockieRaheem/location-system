import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Country, 
  AdminLevel, 
  AdminUnit, 
  UpdateHistory,
  CountryWithStats,
  AdminUnitHierarchy,
  LevelStatistics
} from '../../types/location.types';

// Collections
const COUNTRIES_COLLECTION = 'countries';
const ADMIN_LEVELS_COLLECTION = 'adminLevels';
const ADMIN_UNITS_COLLECTION = 'adminUnits';
const UPDATE_HISTORY_COLLECTION = 'updateHistory';

// Country Operations
export const locationService = {
  // ============ COUNTRY OPERATIONS ============
  
  async getAllCountries(): Promise<Country[]> {
    const snapshot = await getDocs(collection(db, COUNTRIES_COLLECTION));
    return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Country));
  },

  async getCountryById(countryId: string): Promise<Country | null> {
    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Country : null;
  },

  async createCountry(countryData: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, COUNTRIES_COLLECTION), {
      ...countryData,
      createdAt: now,
      updatedAt: now,
    });
    
    // Log creation
    await this.logUpdate({
      entityType: 'country',
      entityId: docRef.id,
      action: 'create',
      fieldChanges: {},
      performedBy: countryData.createdBy,
      performedAt: now,
    });
    
    return docRef.id;
  },

  async updateCountry(
    countryId: string, 
    updates: Partial<Country>, 
    userId: string,
    reason?: string
  ): Promise<void> {
    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    const oldData = await this.getCountryById(countryId);
    
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    // Log changes
    const fieldChanges: Record<string, { oldValue: any; newValue: any }> = {};
    Object.keys(updates).forEach(key => {
      if (oldData && oldData[key as keyof Country] !== updates[key as keyof Country]) {
        fieldChanges[key] = {
          oldValue: oldData[key as keyof Country],
          newValue: updates[key as keyof Country],
        };
      }
    });

    await this.logUpdate({
      entityType: 'country',
      entityId: countryId,
      action: 'update',
      fieldChanges,
      performedBy: userId,
      performedAt: now,
      reason,
    });
  },

  // ============ ADMIN LEVEL OPERATIONS ============

  async getAdminLevelsByCountry(countryId: string): Promise<AdminLevel[]> {
    const q = query(
      collection(db, ADMIN_LEVELS_COLLECTION),
      where('countryId', '==', countryId),
      orderBy('levelNumber', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as AdminLevel));
  },

  async createAdminLevel(levelData: Omit<AdminLevel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, ADMIN_LEVELS_COLLECTION), {
      ...levelData,
      createdAt: now,
      updatedAt: now,
    });

    await this.logUpdate({
      entityType: 'adminLevel',
      entityId: docRef.id,
      action: 'create',
      fieldChanges: {},
      performedBy: levelData.createdBy,
      performedAt: now,
    });

    return docRef.id;
  },

  async updateAdminLevel(
    levelId: string,
    updates: Partial<AdminLevel>,
    userId: string,
    reason?: string
  ): Promise<void> {
    const docRef = doc(db, ADMIN_LEVELS_COLLECTION, levelId);
    const now = new Date().toISOString();
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    await this.logUpdate({
      entityType: 'adminLevel',
      entityId: levelId,
      action: 'update',
      fieldChanges: {},
      performedBy: userId,
      performedAt: now,
      reason,
    });
  },

  // ============ ADMIN UNIT OPERATIONS ============

  async getAdminUnitsByLevel(countryId: string, levelId: string): Promise<AdminUnit[]> {
    const q = query(
      collection(db, ADMIN_UNITS_COLLECTION),
      where('countryId', '==', countryId),
      where('levelId', '==', levelId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as AdminUnit));
  },

  async getAdminUnitsByParent(parentUnitId: string): Promise<AdminUnit[]> {
    const q = query(
      collection(db, ADMIN_UNITS_COLLECTION),
      where('parentUnitId', '==', parentUnitId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as AdminUnit));
  },

  async createAdminUnit(unitData: Omit<AdminUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, ADMIN_UNITS_COLLECTION), {
      ...unitData,
      createdAt: now,
      updatedAt: now,
    });

    await this.logUpdate({
      entityType: 'adminUnit',
      entityId: docRef.id,
      action: 'create',
      fieldChanges: {},
      performedBy: unitData.createdBy,
      performedAt: now,
    });

    return docRef.id;
  },

  async updateAdminUnit(
    unitId: string,
    updates: Partial<AdminUnit>,
    userId: string,
    reason?: string
  ): Promise<void> {
    const docRef = doc(db, ADMIN_UNITS_COLLECTION, unitId);
    const now = new Date().toISOString();
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });

    await this.logUpdate({
      entityType: 'adminUnit',
      entityId: unitId,
      action: 'update',
      fieldChanges: {},
      performedBy: userId,
      performedAt: now,
      reason,
    });
  },

  // ============ HIERARCHY OPERATIONS ============

  async getAdminUnitHierarchy(countryId: string, parentUnitId?: string): Promise<AdminUnitHierarchy[]> {
    const q = parentUnitId
      ? query(
          collection(db, ADMIN_UNITS_COLLECTION),
          where('countryId', '==', countryId),
          where('parentUnitId', '==', parentUnitId),
          where('isActive', '==', true)
        )
      : query(
          collection(db, ADMIN_UNITS_COLLECTION),
          where('countryId', '==', countryId),
          where('parentUnitId', '==', null),
          where('isActive', '==', true)
        );

    const snapshot = await getDocs(q);
    const units = snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as AdminUnit));

    // Fetch level details and child counts for each unit
    const hierarchyUnits: AdminUnitHierarchy[] = await Promise.all(
      units.map(async (unit: AdminUnit) => {
        const levelDoc = await getDoc(doc(db, ADMIN_LEVELS_COLLECTION, unit.levelId));
        const level = { id: levelDoc.id, ...levelDoc.data() } as AdminLevel;
        
        const childrenSnapshot = await getDocs(
          query(
            collection(db, ADMIN_UNITS_COLLECTION),
            where('parentUnitId', '==', unit.id),
            where('isActive', '==', true)
          )
        );

        return {
          ...unit,
          level,
          childCount: childrenSnapshot.size,
        };
      })
    );

    return hierarchyUnits;
  },

  // ============ HISTORY OPERATIONS ============

  async logUpdate(historyData: Omit<UpdateHistory, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, UPDATE_HISTORY_COLLECTION), historyData);
    return docRef.id;
  },

  async getUpdateHistory(entityType: string, entityId: string): Promise<UpdateHistory[]> {
    const q = query(
      collection(db, UPDATE_HISTORY_COLLECTION),
      where('entityType', '==', entityType),
      where('entityId', '==', entityId),
      orderBy('performedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as UpdateHistory));
  },

  // ============ STATISTICS ============

  async getCountryStats(countryId: string): Promise<LevelStatistics[]> {
    const levels = await this.getAdminLevelsByCountry(countryId);
    
    const stats: LevelStatistics[] = await Promise.all(
      levels.map(async (level) => {
        const allUnitsQuery = query(
          collection(db, ADMIN_UNITS_COLLECTION),
          where('countryId', '==', countryId),
          where('levelId', '==', level.id)
        );
        const allUnits = await getDocs(allUnitsQuery);
        
        const activeUnitsQuery = query(
          collection(db, ADMIN_UNITS_COLLECTION),
          where('countryId', '==', countryId),
          where('levelId', '==', level.id),
          where('isActive', '==', true)
        );
        const activeUnits = await getDocs(activeUnitsQuery);

        return {
          levelId: level.id,
          levelName: level.levelName,
          totalUnits: allUnits.size,
          activeUnits: activeUnits.size,
          inactiveUnits: allUnits.size - activeUnits.size,
        };
      })
    );

    return stats;
  },
};
