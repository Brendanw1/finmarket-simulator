import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { Portfolio, Trade, Scenario, ScenarioResult, UploadedMaterial, User } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ===== Authentication Functions =====

export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Create user document in Firestore
  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || email,
    displayName,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
  });

  return user;
};

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ===== User Functions =====

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt.toDate(),
    };
  }

  return null;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updates);
};

// ===== Portfolio Functions =====

export const createPortfolio = async (userId: string, initialCash: number): Promise<Portfolio> => {
  const portfolio: Portfolio = {
    id: '',
    userId,
    cash: initialCash,
    totalValue: initialCash,
    positions: [],
    performance: [{
      timestamp: new Date(),
      totalValue: initialCash,
      profitLoss: 0,
      profitLossPercent: 0,
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'portfolios'), {
    ...portfolio,
    createdAt: Timestamp.fromDate(portfolio.createdAt),
    updatedAt: Timestamp.fromDate(portfolio.updatedAt),
    performance: portfolio.performance.map(p => ({
      ...p,
      timestamp: Timestamp.fromDate(p.timestamp),
    })),
  });

  portfolio.id = docRef.id;
  return portfolio;
};

export const getPortfolio = async (portfolioId: string): Promise<Portfolio | null> => {
  const docRef = doc(db, 'portfolios', portfolioId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      cash: data.cash,
      totalValue: data.totalValue,
      positions: data.positions || [],
      performance: (data.performance || []).map((p: { timestamp: Timestamp; totalValue: number; profitLoss: number; profitLossPercent: number }) => ({
        timestamp: p.timestamp.toDate(),
        totalValue: p.totalValue,
        profitLoss: p.profitLoss,
        profitLossPercent: p.profitLossPercent,
      })),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  return null;
};

export const getUserPortfolio = async (userId: string): Promise<Portfolio | null> => {
  const q = query(
    collection(db, 'portfolios'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      cash: data.cash,
      totalValue: data.totalValue,
      positions: data.positions || [],
      performance: (data.performance || []).map((p: { timestamp: Timestamp; totalValue: number; profitLoss: number; profitLossPercent: number }) => ({
        timestamp: p.timestamp.toDate(),
        totalValue: p.totalValue,
        profitLoss: p.profitLoss,
        profitLossPercent: p.profitLossPercent,
      })),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  return null;
};

export const updatePortfolio = async (portfolioId: string, updates: Partial<Portfolio>): Promise<void> => {
  const docRef = doc(db, 'portfolios', portfolioId);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.performance) {
    updateData.performance = updates.performance.map(p => ({
      ...p,
      timestamp: Timestamp.fromDate(p.timestamp),
    }));
  }

  await updateDoc(docRef, updateData);
};

export const subscribeToPortfolio = (
  portfolioId: string,
  callback: (portfolio: Portfolio) => void
) => {
  const docRef = doc(db, 'portfolios', portfolioId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const portfolio: Portfolio = {
        id: docSnap.id,
        userId: data.userId,
        cash: data.cash,
        totalValue: data.totalValue,
        positions: data.positions || [],
        performance: (data.performance || []).map((p: { timestamp: Timestamp; totalValue: number; profitLoss: number; profitLossPercent: number }) => ({
          timestamp: p.timestamp.toDate(),
          totalValue: p.totalValue,
          profitLoss: p.profitLoss,
          profitLossPercent: p.profitLossPercent,
        })),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      callback(portfolio);
    }
  });
};

// ===== Trade Functions =====

export const saveTrade = async (trade: Trade): Promise<string> => {
  const docRef = await addDoc(collection(db, 'trades'), {
    ...trade,
    timestamp: Timestamp.fromDate(trade.timestamp),
  });

  return docRef.id;
};

export const getPortfolioTrades = async (portfolioId: string): Promise<Trade[]> => {
  const q = query(
    collection(db, 'trades'),
    where('portfolioId', '==', portfolioId),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      portfolioId: data.portfolioId,
      assetId: data.assetId,
      symbol: data.symbol,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      total: data.total,
      timestamp: data.timestamp.toDate(),
      status: data.status,
    };
  });
};

// ===== Scenario Functions =====

export const saveScenario = async (scenario: Scenario): Promise<string> => {
  const docRef = await addDoc(collection(db, 'scenarios'), {
    ...scenario,
    createdAt: Timestamp.fromDate(scenario.createdAt),
  });

  return docRef.id;
};

export const getScenario = async (scenarioId: string): Promise<Scenario | null> => {
  const docRef = doc(db, 'scenarios', scenarioId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      initialCash: data.initialCash,
      duration: data.duration,
      objectives: data.objectives,
      marketConditions: data.marketConditions,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
    };
  }

  return null;
};

export const getUserScenarios = async (userId: string): Promise<Scenario[]> => {
  const q = query(
    collection(db, 'scenarios'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      initialCash: data.initialCash,
      duration: data.duration,
      objectives: data.objectives,
      marketConditions: data.marketConditions,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
    };
  });
};

// ===== Scenario Results Functions =====

export const saveScenarioResult = async (result: ScenarioResult): Promise<string> => {
  const docRef = await addDoc(collection(db, 'scenarioResults'), {
    ...result,
    completedAt: Timestamp.fromDate(result.completedAt),
    trades: result.trades.map(t => ({
      ...t,
      timestamp: Timestamp.fromDate(t.timestamp),
    })),
  });

  return docRef.id;
};

export const getUserScenarioResults = async (userId: string): Promise<ScenarioResult[]> => {
  const q = query(
    collection(db, 'scenarioResults'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      scenarioId: data.scenarioId,
      userId: data.userId,
      finalValue: data.finalValue,
      returnPercent: data.returnPercent,
      objectivesCompleted: data.objectivesCompleted,
      totalObjectives: data.totalObjectives,
      trades: data.trades.map((t: { id: string; portfolioId: string; assetId: string; symbol: string; type: string; quantity: number; price: number; total: number; timestamp: Timestamp; status: string }) => ({
        ...t,
        timestamp: t.timestamp.toDate(),
      })),
      score: data.score,
      feedback: data.feedback,
      completedAt: data.completedAt.toDate(),
    };
  });
};

// ===== Uploaded Materials Functions =====

export const saveUploadedMaterial = async (material: UploadedMaterial): Promise<string> => {
  const docRef = await addDoc(collection(db, 'materials'), {
    ...material,
    uploadedAt: Timestamp.fromDate(material.uploadedAt),
  });

  return docRef.id;
};

export const getUserMaterials = async (userId: string): Promise<UploadedMaterial[]> => {
  const q = query(
    collection(db, 'materials'),
    where('userId', '==', userId),
    orderBy('uploadedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      content: data.content,
      uploadedAt: data.uploadedAt.toDate(),
      status: data.status,
    };
  });
};

export const updateMaterialStatus = async (
  materialId: string,
  status: 'processing' | 'ready' | 'error'
): Promise<void> => {
  const docRef = doc(db, 'materials', materialId);
  await updateDoc(docRef, { status });
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  const docRef = doc(db, 'materials', materialId);
  await deleteDoc(docRef);
};
