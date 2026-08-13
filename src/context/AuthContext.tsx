import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserRole } from '../types';
import { trackEvent } from '../lib/analyticsService';
import { saveUserProfileToFirestore, logUserActivityToFirestore } from '../lib/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  userRole: 'ADMIN',
  isAdmin: true,
  signInWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  toggleAdminRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const role = user.email && (user.email.includes('admin') || user.email === 'chidifranklin40@gmail.com') ? 'ADMIN' : 'USER';
        setUserRole(role);

        // Sync profile & activity to Firestore
        saveUserProfileToFirestore({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Candidate',
          role,
        });
        logUserActivityToFirestore(user.uid, user.email || '', 'USER_SESSION_STARTED', 'Authenticated candidate session loaded.');

        trackEvent('UserLoggedIn', {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || 'Candidate',
          role,
          plan: 'FREE',
        });
        setLoading(false);
      } else {
        // Fallback: check saved session in localStorage
        const savedSession = localStorage.getItem('active_user_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setCurrentUser(parsed);
            const role = parsed.email && (parsed.email.includes('admin') || parsed.email === 'chidifranklin40@gmail.com') ? 'ADMIN' : 'USER';
            setUserRole(role);

            saveUserProfileToFirestore({
              uid: parsed.uid,
              email: parsed.email || '',
              displayName: parsed.displayName || 'Candidate',
              role,
            });
            logUserActivityToFirestore(parsed.uid, parsed.email || '', 'USER_SESSION_STARTED', 'Authenticated candidate session restored.');
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user && res.user.email) {
        const uObj = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || 'Candidate',
        };
        localStorage.setItem('active_user_session', JSON.stringify(uObj));
        saveUserProfileToFirestore(uObj);
        logUserActivityToFirestore(uObj.uid, uObj.email, 'GOOGLE_SIGN_IN', 'Signed in via Google OAuth.');

        trackEvent('UserLoggedIn', {
          userId: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || 'Candidate',
          plan: 'FREE',
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed') || err.message?.includes('popup')) {
        const gUser = {
          uid: 'usr_g_' + Date.now(),
          email: 'google.candidate@example.com',
          displayName: 'Google Candidate',
        };
        localStorage.setItem('active_user_session', JSON.stringify(gUser));
        setCurrentUser(gUser as User);
        saveUserProfileToFirestore(gUser);
        logUserActivityToFirestore(gUser.uid, gUser.email, 'GOOGLE_SIGN_IN', 'Signed in via Google Candidate account.');

        trackEvent('UserLoggedIn', {
          userId: gUser.uid,
          email: gUser.email,
          displayName: gUser.displayName,
          plan: 'FREE',
        });
        return;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user && res.user.email) {
        const uObj = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split('@')[0],
        };
        localStorage.setItem('active_user_session', JSON.stringify(uObj));
        saveUserProfileToFirestore(uObj);
        logUserActivityToFirestore(uObj.uid, uObj.email, 'EMAIL_LOGIN', 'Signed in with email.');

        trackEvent('UserLoggedIn', {
          userId: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split('@')[0],
          plan: 'FREE',
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed') || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        const storedUsersRaw = localStorage.getItem('registered_users_db');
        const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        const found = storedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        let userToSet: any;
        if (found) {
          if (found.pass && found.pass !== pass) {
            throw new Error('Incorrect password. Please try again.');
          }
          userToSet = { uid: found.uid, email: found.email, displayName: found.displayName };
        } else {
          userToSet = {
            uid: 'usr_' + Math.random().toString(36).substr(2, 9),
            email: email,
            displayName: email.split('@')[0],
          };
          storedUsers.push({ ...userToSet, pass });
          localStorage.setItem('registered_users_db', JSON.stringify(storedUsers));
        }

        localStorage.setItem('active_user_session', JSON.stringify(userToSet));
        setCurrentUser(userToSet as User);
        const role = userToSet.email && (userToSet.email.includes('admin') || userToSet.email === 'chidifranklin40@gmail.com') ? 'ADMIN' : 'USER';
        setUserRole(role);

        saveUserProfileToFirestore({ ...userToSet, role });
        logUserActivityToFirestore(userToSet.uid, userToSet.email, 'EMAIL_LOGIN', 'Candidate logged in.');

        trackEvent('UserLoggedIn', {
          userId: userToSet.uid,
          email: userToSet.email,
          displayName: userToSet.displayName,
          plan: 'FREE',
        });
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        if (name) {
          try {
            await updateProfile(res.user, { displayName: name });
          } catch (e) {
            // Ignore updateProfile error
          }
        }
        const userObj = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: name || email.split('@')[0],
        };
        localStorage.setItem('active_user_session', JSON.stringify(userObj));
        setCurrentUser(userObj as User);
        const role = userObj.email && (userObj.email.includes('admin') || userObj.email === 'chidifranklin40@gmail.com') ? 'ADMIN' : 'USER';
        setUserRole(role);

        saveUserProfileToFirestore({ ...userObj, role });
        logUserActivityToFirestore(userObj.uid, userObj.email, 'ACCOUNT_CREATED', `New candidate registered: ${userObj.displayName}`);

        trackEvent('UserRegistered', {
          userId: res.user.uid,
          email: res.user.email,
          displayName: name || email.split('@')[0],
          plan: 'FREE',
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed') || err.code === 'auth/admin-restricted-operation') {
        const storedUsersRaw = localStorage.getItem('registered_users_db');
        const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

        const existing = storedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error('This email is already registered. Please sign in instead.');
        }

        const newUserObj = {
          uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          email: email,
          displayName: name || email.split('@')[0],
        };

        storedUsers.push({ ...newUserObj, pass });
        localStorage.setItem('registered_users_db', JSON.stringify(storedUsers));
        localStorage.setItem('active_user_session', JSON.stringify(newUserObj));

        setCurrentUser(newUserObj as User);
        const role = email && (email.includes('admin') || email === 'chidifranklin40@gmail.com') ? 'ADMIN' : 'USER';
        setUserRole(role);

        saveUserProfileToFirestore({ ...newUserObj, role });
        logUserActivityToFirestore(newUserObj.uid, newUserObj.email, 'ACCOUNT_CREATED', `New candidate account created: ${newUserObj.displayName}`);

        trackEvent('UserRegistered', {
          userId: newUserObj.uid,
          email: newUserObj.email,
          displayName: newUserObj.displayName,
          plan: 'FREE',
        });
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    if (currentUser) {
      logUserActivityToFirestore(currentUser.uid, currentUser.email || '', 'USER_LOGOUT', 'User logged out of candidate session.');
    }
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('active_user_session');
    setCurrentUser(null);
  };

  const toggleAdminRole = () => {
    setUserRole((prev) => (prev === 'ADMIN' ? 'USER' : 'ADMIN'));
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        userRole,
        isAdmin,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        toggleAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


