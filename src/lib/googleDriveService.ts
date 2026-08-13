/**
 * Google Drive Integration Service
 * Interacts with Google Drive v3 REST API to search, list, and download CV files.
 * Uses Google Identity Services (GIS) token client for seamless browser-based OAuth authentication.
 */

import firebaseConfig from '../../firebase-applet-config.json';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Declare GIS global type
declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

/**
 * Ensures Google Identity Services script is loaded into the browser window.
 */
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK script.'));
    document.head.appendChild(script);
  });
}

/**
 * Fallback to Firebase Google Sign-In Popup with Google Drive scope
 */
async function requestAccessTokenViaFirebasePopup(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPES);
  provider.setCustomParameters({ prompt: 'consent' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) {
    throw new Error('Could not obtain Google Drive access token from sign in.');
  }
  return token;
}

/**
 * Requests an OAuth access token from the user for Google Drive access.
 */
export async function requestDriveAccessToken(clientId?: string): Promise<string> {
  const effectiveClientId =
    clientId ||
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    (firebaseConfig as any)?.oAuthClientId ||
    '';

  // Attempt GIS implicit token client if client ID is available
  if (effectiveClientId) {
    try {
      await loadGsiScript();
      if (window.google?.accounts?.oauth2) {
        return await new Promise<string>((resolve, reject) => {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: effectiveClientId,
            scope: DRIVE_SCOPES,
            callback: (response: any) => {
              if (response.error) {
                reject(new Error(response.error_description || response.error || 'Google Drive authorization failed.'));
                return;
              }
              if (response.access_token) {
                resolve(response.access_token);
              } else {
                reject(new Error('No access token received from Google Drive authorization.'));
              }
            },
            error_callback: (err: any) => {
              reject(new Error(err?.message || 'Google Drive authorization was closed or cancelled.'));
            },
          });

          tokenClient.requestAccessToken({ prompt: 'consent' });
        });
      }
    } catch (gisError) {
      console.warn('GIS client auth failed, falling back to Firebase auth popup:', gisError);
    }
  }

  // Fallback to Firebase Google Popup with Drive scope
  return await requestAccessTokenViaFirebasePopup();
}

/**
 * Searches and lists candidate CV/Resume files from the authorized Google Drive.
 */
export async function listDriveCVFiles(accessToken: string): Promise<DriveFileItem[]> {
  // Query for PDFs, Word docs, Google Docs, text files, or files named CV/Resume
  const q = `trashed = false and (
    mimeType = 'application/pdf' or 
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or 
    mimeType = 'application/msword' or 
    mimeType = 'application/vnd.google-apps.document' or 
    mimeType = 'text/plain' or 
    name contains 'CV' or 
    name contains 'cv' or 
    name contains 'Resume' or 
    name contains 'resume'
  )`;

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,mimeType,modifiedTime,size,iconLink,thumbnailLink)&pageSize=30&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch files from Google Drive (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Downloads a Google Drive file as base64 or plain text content.
 */
export async function fetchDriveFileContent(
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<{ fileData?: string; text?: string; fileType: string; fileName: string }> {
  // First, get file metadata for the name
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meta = metaRes.ok ? await metaRes.json() : { name: 'Google_Drive_Document' };
  const fileName = meta.name || 'Google_Drive_Document';

  // Handling Native Google Docs (Export to plain text)
  if (mimeType === 'application/vnd.google-apps.document') {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    const res = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error('Failed to export Google Doc content.');
    }
    const textContent = await res.text();
    return {
      text: textContent,
      fileType: 'text/plain',
      fileName,
    };
  }

  // Handling PDFs / DOCX / Word files (Binary media download)
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download document from Google Drive (${res.status}).`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  return {
    fileData: base64Data,
    fileType: mimeType || 'application/pdf',
    fileName,
  };
}

/**
 * Extracts a Google Drive File ID from shared links.
 * Examples:
 * - https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing
 * - https://docs.google.com/document/d/1a2b3c4d5e/edit
 * - https://drive.google.com/open?id=1a2b3c4d5e
 */
export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const matchFileD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // If input is just the file ID itself
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}
