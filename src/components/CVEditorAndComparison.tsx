import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  Columns,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  Palette,
  ArrowLeft
} from 'lucide-react';
import { StructuredCV, CVTemplateId, StructuredJob } from '../types';

interface CVEditorAndComparisonProps {
  originalCV: StructuredCV;
  optimizedCV: StructuredCV;
  job: StructuredJob;
  onUpdateCV: (updated: StructuredCV) => void;
  onBackToAnalysis: () => void;
}

export const CVEditorAndComparison: React.FC<CVEditorAndComparisonProps> = ({
  originalCV,
  optimizedCV,
  job,
  onUpdateCV,
  onBackToAnalysis,
}) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'editor'>('comparison');
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateId>('classic');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  // Editable fields local state
  const [activeCV, setActiveCV] = useState<StructuredCV>(optimizedCV);

  const handleTextChange = (fieldPath: string, value: any) => {
    const updated = { ...activeCV };
    const parts = fieldPath.split('.');
    
    if (parts.length === 1) {
      (updated as any)[parts[0]] = value;
    } else if (parts.length === 2) {
      (updated as any)[parts[0]][parts[1]] = value;
    }
    
    setActiveCV(updated);
    onUpdateCV(updated);
  };

  const handleExperienceBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
    const updated = { ...activeCV };
    updated.experience[expIdx].achievements[bulletIdx] = val;
    setActiveCV(updated);
    onUpdateCV(updated);
  };

  const handleAddExperienceBullet = (expIdx: number) => {
    const updated = { ...activeCV };
    updated.experience[expIdx].achievements.push('New achievement or responsibility...');
    setActiveCV(updated);
    onUpdateCV(updated);
  };

  const handleDeleteExperienceBullet = (expIdx: number, bulletIdx: number) => {
    const updated = { ...activeCV };
    updated.experience[expIdx].achievements.splice(bulletIdx, 1);
    setActiveCV(updated);
    onUpdateCV(updated);
  };

  // Regenerate Section with AI
  const handleRegenerateSection = async (sectionKey: string) => {
    setRegeneratingSection(sectionKey);
    try {
      const res = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv: activeCV,
          sectionKey,
          job,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveCV(data.cv);
        onUpdateCV(data.cv);
      }
    } catch (err) {
      console.error('Failed to regenerate section:', err);
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Export DOCX
  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv: activeCV,
          templateId: selectedTemplate,
        }),
      });

      if (!res.ok) throw new Error('DOCX export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeCV.personalInfo.fullName.replace(/\s+/g, '_')}_Optimized_CV.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download DOCX document. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv: activeCV,
          templateId: selectedTemplate,
        }),
      });

      if (!res.ok) throw new Error('PDF export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeCV.personalInfo.fullName.replace(/\s+/g, '_')}_Optimized_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download PDF document. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        <div>
          <button
            onClick={onBackToAnalysis}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ATS Match Results</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Optimized CV Workspace</h2>
          <p className="text-xs text-slate-400">
            Compare original vs optimized statements, fine-tune content, choose templates, and export DOCX or PDF.
          </p>
        </div>

        {/* View Mode Toggle & Template Picker */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'comparison' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Before / After View</span>
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'editor' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Live CV Editor</span>
            </button>
          </div>

          {/* Template Selector */}
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as CVTemplateId)}
              className="pl-8 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="classic">Classic Professional</option>
              <option value="modern">Modern Minimal</option>
              <option value="corporate">Corporate</option>
              <option value="technical">Technical</option>
              <option value="executive">Executive</option>
            </select>
            <Palette className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingDocx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>DOCX</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>PDF</span>
            </button>
          </div>

        </div>

      </div>

      {/* VIEW 1: BEFORE & AFTER COMPARISON */}
      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ORIGINAL CV COLUMN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Original Uploaded CV
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Unoptimized</span>
            </div>

            {/* Original Summary */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Summary</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {originalCV.summary || 'No original summary provided.'}
              </p>
            </div>

            {/* Original Core Competencies */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skills & Competencies</h4>
              <div className="flex flex-wrap gap-1">
                {originalCV.coreCompetencies?.map((sc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                    {sc}
                  </span>
                ))}
              </div>
            </div>

            {/* Original Experience */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Experience Statements</h4>
              <div className="space-y-3">
                {originalCV.experience?.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800">{exp.jobTitle} - {exp.company}</p>
                    <ul className="mt-1 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                      {exp.achievements?.map((ach, ai) => (
                        <li key={ai}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OPTIMIZED CV COLUMN */}
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-5">
            <div className="pb-3 border-b border-blue-100 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Optimized CV
              </span>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                Job-Tailored
              </span>
            </div>

            {/* Optimized Summary */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Tailored Professional Summary</h4>
                <button
                  onClick={() => handleRegenerateSection('summary')}
                  disabled={regeneratingSection === 'summary'}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'summary' ? 'animate-spin' : ''}`} />
                  <span>Regenerate Summary</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 bg-blue-50/40 p-3 rounded-xl border border-blue-100 leading-relaxed font-medium">
                {activeCV.summary}
              </p>
            </div>

            {/* Optimized Competencies */}
            <div>
              <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Prioritized Skills & Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeCV.coreCompetencies?.map((sc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-100">
                    {sc}
                  </span>
                ))}
              </div>
            </div>

            {/* Optimized Experience */}
            <div>
              <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">High-Impact Experience Bullets</h4>
              <div className="space-y-3">
                {activeCV.experience?.map((exp, idx) => (
                  <div key={idx} className="bg-blue-50/20 p-3 rounded-xl border border-blue-100 text-xs">
                    <p className="font-bold text-slate-800">{exp.jobTitle} - {exp.company}</p>
                    <ul className="mt-1 space-y-1.5 text-slate-700 list-disc list-inside text-[11px]">
                      {exp.achievements?.map((ach, ai) => (
                        <li key={ai} className="leading-relaxed">{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: LIVE INLINE CV EDITOR */}
      {viewMode === 'editor' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Interactive Resume Content Editor</h3>
              <p className="text-xs text-slate-400 mt-0.5">Edit text directly. All edits preserve layout and export formatting.</p>
            </div>
            <button
              onClick={() => handleRegenerateSection('all')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Entire CV</span>
            </button>
          </div>

          {/* Personal Info Editor */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Personal & Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={activeCV.personalInfo.fullName}
                  onChange={(e) => handleTextChange('personalInfo.fullName', e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Email</label>
                <input
                  type="text"
                  value={activeCV.personalInfo.email}
                  onChange={(e) => handleTextChange('personalInfo.email', e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={activeCV.personalInfo.phone}
                  onChange={(e) => handleTextChange('personalInfo.phone', e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Tailored Professional Summary</h4>
              <button
                onClick={() => handleRegenerateSection('summary')}
                className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Re-write with AI
              </button>
            </div>
            <textarea
              rows={4}
              value={activeCV.summary}
              onChange={(e) => handleTextChange('summary', e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Experience Editor */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. Work Experience & Bullet Achievements</h4>
            
            {activeCV.experience?.map((exp, expIdx) => (
              <div key={expIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-500 text-[10px] mb-0.5">Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const updated = { ...activeCV };
                        updated.experience[expIdx].jobTitle = e.target.value;
                        setActiveCV(updated);
                        onUpdateCV(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 text-[10px] mb-0.5">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = { ...activeCV };
                        updated.experience[expIdx].company = e.target.value;
                        setActiveCV(updated);
                        onUpdateCV(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2 pt-1">
                  <label className="block font-bold text-slate-700 text-[10px]">Bullet Achievements</label>
                  {exp.achievements?.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleExperienceBulletChange(expIdx, bulletIdx, e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                      />
                      <button
                        onClick={() => handleDeleteExperienceBullet(expIdx, bulletIdx)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddExperienceBullet(expIdx)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
