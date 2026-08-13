import React, { useState } from 'react';
import { X, Cloud, Link2, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { StructuredCV } from '../types';

interface CloudUrlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCVParsed: (cv: StructuredCV) => void;
}

export const CloudUrlImportModal: React.FC<CloudUrlImportModalProps> = ({
  isOpen,
  onClose,
  onCVParsed,
}) => {
  const [cloudUrl, setCloudUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudUrl.trim()) {
      setError('Please enter a valid document share link.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/parse-cloud-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cloudUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to download and parse document from cloud storage URL.');
      }

      onCVParsed(data.cv);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing cloud document URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-400/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Cloud Storage Link Import</h3>
              <p className="text-slate-400 text-xs">Import from Dropbox, OneDrive, iCloud, or public file URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Cloud Import Error</p>
                <p className="text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-purple-600" />
              Cloud Storage Share URL
            </label>
            <input
              type="url"
              value={cloudUrl}
              onChange={(e) => setCloudUrl(e.target.value)}
              placeholder="https://www.dropbox.com/s/.../resume.pdf or OneDrive share link"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 font-mono text-slate-800"
              required
            />
          </div>

          <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-100 text-[11px] text-purple-900 space-y-1">
            <p className="font-bold">Tips for cloud links:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-purple-800">
              <li><strong>Dropbox:</strong> Copy share link (e.g. <code>https://www.dropbox.com/s/...</code>).</li>
              <li><strong>OneDrive:</strong> Use "Anyone with link can view".</li>
              <li><strong>Direct File URL:</strong> Links ending in <code>.pdf</code> or <code>.docx</code>.</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !cloudUrl.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Document...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Fetch & Parse CV</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
