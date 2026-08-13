import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  RefreshCw,
  FileCode,
  HardDrive,
  Cloud,
  Link2,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { StructuredCV } from '../types';
import { GoogleDriveModal } from './GoogleDriveModal';
import { CloudUrlImportModal } from './CloudUrlImportModal';
import { useAuth } from '../context/AuthContext';
import {
  fetchUploadedCVsFromFirestore,
  UploadedCVRecord,
  deleteUploadedCVFromFirestore,
} from '../lib/firestoreService';

interface CVUploadStepProps {
  parsedCV: StructuredCV | null;
  onCVParsed: (cv: StructuredCV) => void;
  onNextStep: () => void;
}

export const CVUploadStep: React.FC<CVUploadStepProps> = ({ parsedCV, onCVParsed, onNextStep }) => {
  const { currentUser } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Stored Uploaded Base Resumes from Firestore
  const [storedCVs, setStoredCVs] = useState<UploadedCVRecord[]>([]);

  // Cloud Modals
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  useEffect(() => {
    async function loadStoredCVs() {
      if (currentUser?.uid) {
        const cvs = await fetchUploadedCVsFromFirestore(currentUser.uid);
        setStoredCVs(cvs);
      }
    }
    loadStoredCVs();
  }, [currentUser, parsedCV]);

  const handleDeleteStoredCV = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.uid) return;
    setStoredCVs((prev) => prev.filter((c) => c.id !== id));
    await deleteUploadedCVFromFirestore(currentUser.uid, id);
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    const validTypes = ['pdf', 'word', 'docx', 'text/plain'];
    const isExtensionValid = /\.(pdf|docx|doc|txt)$/i.test(file.name);
    if (!isExtensionValid && !validTypes.some((t) => file.type.includes(t))) {
      setErrorMessage('Unsupported file format. Please upload a PDF or Microsoft Word (.docx) document.');
      return;
    }

    setIsLoading(true);
    setUploadedFileName(file.name);
    setProgressStatus('Reading document...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1] || result;

          setProgressStatus('Extracting text and identifying CV sections...');

          const res = await fetch('/api/parse-cv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              fileType: file.type || file.name,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to parse CV file.');
          }

          setProgressStatus('Finalizing structured CV facts...');
          onCVParsed(data.cv);
        } catch (err: any) {
          setErrorMessage(err.message || 'Error parsing document.');
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read file from disk.');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'File processing failed.');
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      setErrorMessage('Please paste your CV text into the text box.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setProgressStatus('Parsing CV text structure...');

    try {
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse pasted CV text.');
      }

      onCVParsed(data.cv);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse CV text.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
            Step 1 of 3
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Upload Your Existing CV / Resume</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Extract contact info, experience bullets, and skills into a structured schema without altering factual history.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'paste' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Paste Raw Text
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Upload Error</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Upload Zone */}
      {!parsedCV && mode === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            {isLoading ? (
              <div className="py-8 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{progressStatus}</p>
                  <p className="text-xs text-slate-400 mt-1">Extracting experience, competencies, and achievements...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-base">Drag and drop your CV file here</p>
                  <p className="text-slate-400 text-xs mt-0.5">Supports PDF and Word (.docx) files up to 10MB</p>
                </div>

                <div className="pt-2">
                  <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2 transition-all">
                    <FileText className="w-4 h-4" />
                    <span>Browse Local File</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFile(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Storage Options Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  Cloud Storage Imports
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 font-semibold px-2 py-0.5 rounded-full">New</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Import CV directly from Google Drive, Dropbox, OneDrive, or shared web links.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setIsDriveModalOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <HardDrive className="w-4 h-4" />
                <span>Google Drive</span>
              </button>

              <button
                onClick={() => setIsCloudModalOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Link2 className="w-4 h-4 text-purple-400" />
                <span>Dropbox / Cloud URL</span>
              </button>
            </div>
          </div>

          {/* Saved Base Resumes in Firestore / Storage */}
          {storedCVs.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Your Stored Base Resumes ({storedCVs.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Saved in Firestore</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storedCVs.map((scv) => (
                  <div
                    key={scv.id}
                    onClick={() => {
                      setUploadedFileName(scv.fileName);
                      onCVParsed(scv.structuredCV);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="font-bold text-xs text-slate-800 truncate group-hover:text-blue-700">
                        {scv.fileName || scv.structuredCV?.personalInfo?.fullName || 'Stored Resume'}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Uploaded {scv.uploadedAt ? new Date(scv.uploadedAt).toLocaleDateString() : 'recently'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">
                        Select
                      </span>
                      <button
                        onClick={(e) => handleDeleteStoredCV(scv.id, e)}
                        title="Delete from database"
                        className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Zone */}
      {!parsedCV && mode === 'paste' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Paste Full CV Text</label>
          <textarea
            rows={10}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your existing resume summary, experience, skills, and education text here..."
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono bg-slate-50 text-slate-800"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePasteSubmit}
              disabled={isLoading || !pasteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing Text...</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>Parse CV Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Parsed CV Fact Card Preview */}
      {parsedCV && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">CV Successfully Parsed</h3>
                <p className="text-xs text-slate-400">
                  {uploadedFileName ? `Source: ${uploadedFileName}` : 'Structured from document / cloud source'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onCVParsed(null as any);
                setUploadedFileName(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Replace File</span>
            </button>
          </div>

          {/* Fact Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Candidate Contact
              </span>
              <p className="font-bold text-slate-800 text-sm">{parsedCV.personalInfo.fullName}</p>
              <p className="text-slate-600">
                {parsedCV.personalInfo.email} • {parsedCV.personalInfo.phone}
              </p>
              <p className="text-slate-500">{parsedCV.personalInfo.location}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Parsed Overview
              </span>
              <p className="text-slate-700 font-semibold">Experience Items: {parsedCV.experience?.length || 0}</p>
              <p className="text-slate-700 font-semibold">Education Records: {parsedCV.education?.length || 0}</p>
              <p className="text-slate-700 font-semibold">Core Skills Extracted: {parsedCV.coreCompetencies?.length || 0}</p>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onNextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Next: Add Job Description</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cloud Storage Modals */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onCVParsed={(cv) => {
          onCVParsed(cv);
          setIsDriveModalOpen(false);
        }}
      />

      <CloudUrlImportModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onCVParsed={(cv) => {
          onCVParsed(cv);
          setIsCloudModalOpen(false);
        }}
      />
    </div>
  );
};
