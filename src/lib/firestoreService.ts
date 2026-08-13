import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { SavedRecord, StructuredCV, StructuredJob, ATSAnalysisResult } from '../types';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
  lastActiveAt?: string;
  cvsUploadedCount?: number;
  optimizationsCount?: number;
}

export interface UploadedCVRecord {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: string;
  structuredCV: StructuredCV;
  rawText?: string;
}

export interface UserActivityRecord {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface DraftWorkspaceData {
  parsedCV: StructuredCV | null;
  parsedJob: StructuredJob | null;
  atsAnalysis: ATSAnalysisResult | null;
  optimizedCV: StructuredCV | null;
  step: string;
  updatedAt: string;
}

/**
 * Handle and format Firestore errors for diagnostic consistency
 */
function handleFirestoreError(error: unknown, op: string, path: string) {
  console.warn(`Firestore [${op}] warning for path ${path}:`, error);
}

// ------------------------------------------------------------------
// 1. USER PROFILE MANAGEMENT
// ------------------------------------------------------------------

export async function saveUserProfileToFirestore(profile: UserProfileData): Promise<void> {
  if (!profile?.uid) return;
  const now = new Date().toISOString();
  const userData = {
    uid: profile.uid,
    email: profile.email || '',
    displayName: profile.displayName || profile.email?.split('@')[0] || 'Candidate',
    photoURL: profile.photoURL || '',
    role: profile.role || 'USER',
    lastActiveAt: now,
    createdAt: profile.createdAt || now,
    cvsUploadedCount: profile.cvsUploadedCount || 0,
    optimizationsCount: profile.optimizationsCount || 0,
  };

  // 1. Save to Local Persistence
  localStorage.setItem(`user_profile_${profile.uid}`, JSON.stringify(userData));

  // 2. Save to Firestore
  if (db) {
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, userData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, 'write', `users/${profile.uid}`);
    }
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfileData | null> {
  if (!userId) return null;
  
  // Try local first
  const local = localStorage.getItem(`user_profile_${userId}`);
  let localData: UserProfileData | null = local ? JSON.parse(local) : null;

  if (db) {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const remoteData = snap.data() as UserProfileData;
        localStorage.setItem(`user_profile_${userId}`, JSON.stringify(remoteData));
        return remoteData;
      }
    } catch (err) {
      handleFirestoreError(err, 'get', `users/${userId}`);
    }
  }

  return localData;
}

// ------------------------------------------------------------------
// 2. UPLOADED CVs MANAGEMENT
// ------------------------------------------------------------------

export async function saveUploadedCVToFirestore(
  userId: string,
  cvRecord: UploadedCVRecord
): Promise<void> {
  if (!userId || !cvRecord) return;

  // 1. Local Storage
  const localKey = `uploaded_cvs_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const existingLocal: UploadedCVRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];
  const updatedLocal = [cvRecord, ...existingLocal.filter((c) => c.id !== cvRecord.id)];
  localStorage.setItem(localKey, JSON.stringify(updatedLocal));

  // 2. Firestore
  if (db) {
    try {
      const cvRef = doc(db, 'users', userId, 'uploadedCVs', cvRecord.id);
      await setDoc(cvRef, cvRecord);

      // Increment profile CV count
      const profile = await fetchUserProfileFromFirestore(userId);
      if (profile) {
        await saveUserProfileToFirestore({
          ...profile,
          cvsUploadedCount: (profile.cvsUploadedCount || 0) + 1,
        });
      }
    } catch (err) {
      handleFirestoreError(err, 'write', `users/${userId}/uploadedCVs/${cvRecord.id}`);
    }
  }
}

export async function fetchUploadedCVsFromFirestore(userId: string): Promise<UploadedCVRecord[]> {
  if (!userId) return [];

  const localKey = `uploaded_cvs_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const localCVs: UploadedCVRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];

  if (db) {
    try {
      const colRef = collection(db, 'users', userId, 'uploadedCVs');
      const q = query(colRef, orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const remoteCVs = snap.docs.map((d) => d.data() as UploadedCVRecord);
        localStorage.setItem(localKey, JSON.stringify(remoteCVs));
        return remoteCVs;
      }
    } catch (err) {
      handleFirestoreError(err, 'list', `users/${userId}/uploadedCVs`);
    }
  }

  return localCVs;
}

export async function deleteUploadedCVFromFirestore(userId: string, cvId: string): Promise<void> {
  if (!userId || !cvId) return;

  const localKey = `uploaded_cvs_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  if (existingLocalRaw) {
    const existingLocal: UploadedCVRecord[] = JSON.parse(existingLocalRaw);
    localStorage.setItem(localKey, JSON.stringify(existingLocal.filter((c) => c.id !== cvId)));
  }

  if (db) {
    try {
      const cvRef = doc(db, 'users', userId, 'uploadedCVs', cvId);
      await deleteDoc(cvRef);
    } catch (err) {
      handleFirestoreError(err, 'delete', `users/${userId}/uploadedCVs/${cvId}`);
    }
  }
}

// ------------------------------------------------------------------
// 3. SAVED OPTIMIZATION RECORDS
// ------------------------------------------------------------------

export async function saveRecordToFirestore(userId: string, record: SavedRecord): Promise<void> {
  if (!userId || !record) return;

  // 1. Local Persistence
  const localKey = `saved_records_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const existingLocal: SavedRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];
  const updatedLocal = [record, ...existingLocal.filter((r) => r.id !== record.id)];
  localStorage.setItem(localKey, JSON.stringify(updatedLocal));

  // 2. Firestore
  if (db) {
    try {
      const recordRef = doc(db, 'users', userId, 'savedRecords', record.id);
      await setDoc(recordRef, {
        ...record,
        userId,
        updatedAt: new Date().toISOString(),
      });

      // Increment optimizations count
      const profile = await fetchUserProfileFromFirestore(userId);
      if (profile) {
        await saveUserProfileToFirestore({
          ...profile,
          optimizationsCount: (profile.optimizationsCount || 0) + 1,
        });
      }
    } catch (err) {
      handleFirestoreError(err, 'write', `users/${userId}/savedRecords/${record.id}`);
    }
  }
}

export async function fetchUserRecordsFromFirestore(userId: string): Promise<SavedRecord[]> {
  if (!userId) return [];

  const localKey = `saved_records_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const localRecords: SavedRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];

  if (db) {
    try {
      const colRef = collection(db, 'users', userId, 'savedRecords');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const remoteRecords = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id || d.id,
            title: data.title,
            createdAt: data.createdAt,
            originalScore: data.originalScore,
            optimizedScore: data.optimizedScore,
            jobTitle: data.jobTitle,
            company: data.company,
            originalCV: data.originalCV,
            optimizedCV: data.optimizedCV,
            analysis: data.analysis,
            selectedTemplate: data.selectedTemplate || 'classic',
          } as SavedRecord;
        });

        localStorage.setItem(localKey, JSON.stringify(remoteRecords));
        return remoteRecords;
      }
    } catch (err) {
      handleFirestoreError(err, 'list', `users/${userId}/savedRecords`);
    }
  }

  return localRecords;
}

export async function deleteRecordFromFirestore(userId: string, recordId: string): Promise<void> {
  if (!userId || !recordId) return;

  const localKey = `saved_records_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  if (existingLocalRaw) {
    const existingLocal: SavedRecord[] = JSON.parse(existingLocalRaw);
    localStorage.setItem(localKey, JSON.stringify(existingLocal.filter((r) => r.id !== recordId)));
  }

  if (db) {
    try {
      const recordRef = doc(db, 'users', userId, 'savedRecords', recordId);
      await deleteDoc(recordRef);
    } catch (err) {
      handleFirestoreError(err, 'delete', `users/${userId}/savedRecords/${recordId}`);
    }
  }
}

// ------------------------------------------------------------------
// 4. USER ACTIVITIES & AUDIT TRAIL
// ------------------------------------------------------------------

export async function logUserActivityToFirestore(
  userId: string,
  userEmail: string,
  action: string,
  details?: string
): Promise<void> {
  if (!userId) return;

  const activityRecord: UserActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId,
    userEmail: userEmail || 'candidate@example.com',
    action,
    details: details || '',
    timestamp: new Date().toISOString(),
  };

  // Local Storage
  const localKey = `user_activities_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const existingLocal: UserActivityRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];
  const updatedLocal = [activityRecord, ...existingLocal].slice(0, 50);
  localStorage.setItem(localKey, JSON.stringify(updatedLocal));

  // Firestore
  if (db) {
    try {
      const actRef = doc(db, 'users', userId, 'activities', activityRecord.id);
      await setDoc(actRef, activityRecord);
    } catch (err) {
      handleFirestoreError(err, 'write', `users/${userId}/activities/${activityRecord.id}`);
    }
  }
}

export async function fetchUserActivitiesFromFirestore(userId: string): Promise<UserActivityRecord[]> {
  if (!userId) return [];

  const localKey = `user_activities_${userId}`;
  const existingLocalRaw = localStorage.getItem(localKey);
  const localActs: UserActivityRecord[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];

  if (db) {
    try {
      const colRef = collection(db, 'users', userId, 'activities');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const remoteActs = snap.docs.map((d) => d.data() as UserActivityRecord);
        localStorage.setItem(localKey, JSON.stringify(remoteActs));
        return remoteActs;
      }
    } catch (err) {
      handleFirestoreError(err, 'list', `users/${userId}/activities`);
    }
  }

  return localActs;
}

// ------------------------------------------------------------------
// 5. DRAFT WORKSPACE PERSISTENCE
// ------------------------------------------------------------------

export async function saveDraftWorkspaceToFirestore(
  userId: string,
  draft: DraftWorkspaceData
): Promise<void> {
  if (!userId) return;

  const draftKey = `draft_workspace_${userId}`;
  localStorage.setItem(draftKey, JSON.stringify(draft));

  if (db) {
    try {
      const draftRef = doc(db, 'users', userId, 'draftWorkspace', 'current');
      await setDoc(draftRef, draft);
    } catch (err) {
      handleFirestoreError(err, 'write', `users/${userId}/draftWorkspace/current`);
    }
  }
}

export async function fetchDraftWorkspaceFromFirestore(userId: string): Promise<DraftWorkspaceData | null> {
  if (!userId) return null;

  const draftKey = `draft_workspace_${userId}`;
  const localDraft = localStorage.getItem(draftKey);

  if (db) {
    try {
      const draftRef = doc(db, 'users', userId, 'draftWorkspace', 'current');
      const snap = await getDoc(draftRef);
      if (snap.exists()) {
        const remoteDraft = snap.data() as DraftWorkspaceData;
        localStorage.setItem(draftKey, JSON.stringify(remoteDraft));
        return remoteDraft;
      }
    } catch (err) {
      handleFirestoreError(err, 'get', `users/${userId}/draftWorkspace/current`);
    }
  }

  return localDraft ? JSON.parse(localDraft) : null;
}
