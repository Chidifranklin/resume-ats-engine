import React, { useState } from 'react';
import { Briefcase, FileText, AlertCircle, ArrowRight, RefreshCw, Trash2, Code, Award, Building2 } from 'lucide-react';
import { StructuredJob } from '../types';

interface JobDescriptionStepProps {
  parsedJob: StructuredJob | null;
  onJobParsed: (job: StructuredJob) => void;
  onNextStep: () => void;
  onBackStep: () => void;
}

export const JobDescriptionStep: React.FC<JobDescriptionStepProps> = ({
  parsedJob,
  onJobParsed,
  onNextStep,
  onBackStep,
}) => {
  const [jobTitle, setJobTitle] = useState(parsedJob?.jobTitle || '');
  const [company, setCompany] = useState(parsedJob?.company || '');
  const [jobText, setJobText] = useState(parsedJob?.rawText || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleParseJob = async () => {
    if (!jobText.trim()) {
      setErrorMessage('Please paste or upload the job description text.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Job Title: ${jobTitle}\nCompany: ${company}\n\n${jobText}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract job requirements.');
      }

      const extracted: StructuredJob = data.job;
      if (jobTitle) extracted.jobTitle = jobTitle;
      if (company) extracted.company = company;

      onJobParsed(extracted);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing job description.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Step 2 of 3</span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Target Job Description & Requirements</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Provide the job posting details. AI will extract required skills, keywords, responsibilities, and qualifications for ATS benchmarking.
          </p>
        </div>

        <button
          onClick={onBackStep}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          ← Back to CV Upload
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Extraction Error</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      {!parsedJob && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Job Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Data Analyst, Full Stack Developer"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Health, Nova Enterprise"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Job Description & Requirements Text
            </label>
            <textarea
              rows={10}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the complete job posting text including responsibilities, required qualifications, technical skills, and experience criteria..."
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono bg-slate-50 text-slate-800"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleParseJob}
              disabled={isLoading || !jobText.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Requirements...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Extract Job Requirements</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Extracted Job Requirements Card */}
      {parsedJob && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">{parsedJob.jobTitle}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-xs border border-blue-100">
                  {parsedJob.company}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Extracted Qualifications & Requirements Matrix</p>
            </div>

            <button
              onClick={() => onJobParsed(null as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Edit Job Posting</span>
            </button>
          </div>

          {/* Extracted Tags */}
          <div className="space-y-4">
            
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                Required Technical Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {parsedJob.requiredSkills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {parsedJob.preferredSkills?.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Preferred / Bonus Qualifications
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {parsedJob.preferredSkills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Core Responsibilities
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
                {parsedJob.responsibilities?.slice(0, 5).map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Next CTA */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onBackStep}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              ← Edit CV First
            </button>

            <button
              onClick={onNextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Run ATS Compatibility Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
