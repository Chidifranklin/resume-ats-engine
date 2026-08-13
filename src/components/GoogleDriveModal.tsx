import React, { useState } from 'react';
import {
  X,
  HardDrive,
  FileText,
  File,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import {
  requestDriveAccessToken,
  listDriveCVFiles,
  fetchDriveFileContent,
  extractDriveFileId,
  DriveFileItem,
} from '../lib/googleDriveService';
import { StructuredCV } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCVParsed: (cv: StructuredCV) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose, onCVParsed }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [directLinkInput, setDirectLinkInput] = useState('');

  if (!isOpen) return null;

  const handleAuthorize = async () => {
    setError(null);
    setIsAuthorizing(true);
    try {
      const token = await requestDriveAccessToken();
      setAccessToken(token);
      await loadFiles(token);
    } catch (err: any) {
      setError(err.message || 'Google Drive authorization failed.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const loadFiles = async (token: string) => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const driveFiles = await listDriveCVFiles(token);
      setFiles(driveFiles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    setSelectedFileId(file.id);
    setIsProcessingFile(true);
    setError(null);
    setStatusMessage(`Downloading ${file.name} from Google Drive...`);

    try {
      const content = await fetchDriveFileContent(accessToken, file.id, file.mimeType);

      setStatusMessage('Extracting CV sections with AI...');
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content.text,
          fileData: content.fileData,
          fileType: content.fileType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse CV file from Google Drive.');
      }

      onCVParsed(data.cv);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import document from Google Drive.');
    } finally {
      setIsProcessingFile(false);
      setSelectedFileId(null);
    }
  };

  const handleDirectLinkSubmit = async () => {
    if (!directLinkInput.trim()) return;

    const fileId = extractDriveFileId(directLinkInput);
    if (!fileId) {
      setError('Invalid Google Drive share link. Please paste a valid Google Drive file or document link.');
      return;
    }

    setIsProcessingFile(true);
    setError(null);
    setStatusMessage('Fetching Google Drive shared document...');

    try {
      const res = await fetch('/api/parse-cloud-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: directLinkInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not parse document from Google Drive link. Ensure link sharing is enabled.');
      }

      onCVParsed(data.cv);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import document from Google Drive link.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const getMimeBadge = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>;
    }
    if (mimeType.includes('word') || mimeType.includes('officedocument')) {
      return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">DOCX</span>;
    }
    if (mimeType.includes('google-apps.document')) {
      return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">G-DOC</span>;
    }
    return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">TXT</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Import from Google Drive
                <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">Cloud</span>
              </h3>
              <p className="text-slate-400 text-xs">Select a CV or resume document stored in your Google Drive account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Google Drive Error</p>
                <p className="text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessingFile && (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
              <p className="font-bold text-blue-900 text-sm">{statusMessage}</p>
              <p className="text-xs text-blue-700">Converting and analyzing resume structure...</p>
            </div>
          )}

          {/* Direct Link Option */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              Option A: Paste Google Drive Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={directLinkInput}
                onChange={(e) => setDirectLinkInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://docs.google.com/document/d/..."
                className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleDirectLinkSubmit}
                disabled={isProcessingFile || !directLinkInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Fetch
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              OR Connect Google Account
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Authorization State */}
          {!accessToken ? (
            <div className="border border-slate-200 bg-white p-6 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-bold text-slate-800 text-sm">Connect Google Drive to Browse Documents</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Authorize read-only access to select your CV or resume directly from Google Drive. Your privacy is guaranteed.
                </p>
              </div>
              <button
                onClick={handleAuthorize}
                disabled={isAuthorizing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Google Drive...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Authorize & Connect Google Drive</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* File List State */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Drive files..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => accessToken && loadFiles(accessToken)}
                  disabled={isLoadingFiles}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                {isLoadingFiles ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Scanning Google Drive for CV documents...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No matching CV or resume files found in your Google Drive.
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      disabled={isProcessingFile}
                      className={`w-full p-3.5 flex items-center justify-between text-left hover:bg-blue-50/60 transition-colors cursor-pointer group ${
                        selectedFileId === file.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-900">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {file.modifiedTime ? `Modified: ${new Date(file.modifiedTime).toLocaleDateString()}` : 'Google Drive Document'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getMimeBadge(file.mimeType)}
                        <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Import
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
