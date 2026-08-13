import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Search,
  Info,
} from 'lucide-react';
import { ATSAnalysisResult, KeywordStatus, OptimizationLevel } from '../types';

interface ATSAnalysisViewProps {
  analysis: ATSAnalysisResult;
  onStartOptimization: (level: OptimizationLevel) => void;
  onBackToJob: () => void;
}

export const ATSAnalysisView: React.FC<ATSAnalysisViewProps> = ({
  analysis,
  onStartOptimization,
  onBackToJob,
}) => {
  const [keywordFilter, setKeywordFilter] = useState<'ALL' | KeywordStatus>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<OptimizationLevel>('Balanced');

  const filteredKeywords = analysis.keywordAnalysis?.filter((item) => {
    if (keywordFilter === 'ALL') return true;
    return item.status === keywordFilter;
  }) || [];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getBadgeColor = (status: KeywordStatus) => {
    switch (status) {
      case 'MATCHED':
        return 'bg-green-50 text-green-600 font-bold border-green-100';
      case 'PARTIAL':
        return 'bg-amber-50 text-amber-600 font-bold border-amber-100';
      case 'MISSING':
        return 'bg-rose-50 text-red-500 font-bold border-rose-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Disclaimer Notice */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex items-center gap-2 shadow-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>ATS Compatibility Score</strong> is an estimated compatibility indicator based on standard recruiter screening criteria.
        </span>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Score Gauge */}
        <div className="md:col-span-4 text-center md:border-r border-slate-100 pr-0 md:pr-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Estimated Match</span>
          
          <div className="mt-3 inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-slate-50 border-4 border-blue-600 shadow-xs relative">
            <span className="text-3xl font-bold text-slate-900">{analysis.overallScore}</span>
            <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
          </div>

          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(analysis.overallScore)}`}>
              {analysis.matchLabel}
            </span>
          </div>
        </div>

        {/* Quick Summary Insights */}
        <div className="md:col-span-8 space-y-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Recruiter Screening Summary</span>
          </h3>

          <p className="text-slate-600 text-xs leading-relaxed">
            {analysis.recruiterView?.summary || 'Candidate displays solid foundational qualifications with opportunities to align technical keywords and reframe experience bullets.'}
          </p>

          {/* Quick Strengths / Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
              <span className="font-bold text-green-800 flex items-center gap-1.5 mb-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Key Strengths
              </span>
              <ul className="space-y-0.5 text-slate-700 list-disc list-inside text-[11px]">
                {analysis.recruiterView?.strengths?.slice(0, 3).map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-1 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Identified Gaps
              </span>
              <ul className="space-y-0.5 text-slate-700 list-disc list-inside text-[11px]">
                {analysis.recruiterView?.gaps?.slice(0, 3).map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* 7-DIMENSION SCORE BREAKDOWN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Weighted Dimension Breakdown</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Keywords</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.keywordScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 25</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tech Skills</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.skillsScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 20</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Experience</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.experienceScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 20</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Education</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.educationScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 10</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Role Title</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.jobTitleScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 10</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Impact</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.achievementsScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 5</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Formatting</span>
            <span className="text-base font-bold text-slate-800">{analysis.dimensionScores.formattingScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 10</span>
          </div>

        </div>
      </div>

      {/* KEYWORD MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Keyword & Requirement Alignment Table</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of matched, partial, and missing ATS requirements with evidence from your CV.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['ALL', 'MATCHED', 'PARTIAL', 'MISSING'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setKeywordFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  keywordFilter === st ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Keyword</th>
                <th className="p-3.5">Importance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">CV Evidence</th>
                <th className="p-3.5">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredKeywords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800">{item.keyword}</td>
                  <td className="p-3.5 text-slate-500">{item.importance}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs leading-relaxed">{item.evidence}</td>
                  <td className="p-3.5 text-slate-600 max-w-xs leading-relaxed">{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPTIMIZATION ACTION BOX */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            Next Action Step
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Generate AI Optimized & Tailored CV</h3>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            Select your preferred optimization intensity level. The AI will reframe duty bullets into high-impact action statements while preserving factual accuracy.
          </p>
        </div>

        {/* Level Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div
            onClick={() => setSelectedLevel('Conservative')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedLevel === 'Conservative'
                ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <h4 className="font-bold text-xs text-slate-800">Conservative</h4>
            <p className="text-[11px] text-slate-500 mt-1">Minimal rewriting. Fixes phrasing, grammar, and ATS section structure.</p>
          </div>

          <div
            onClick={() => setSelectedLevel('Balanced')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedLevel === 'Balanced'
                ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-800">Balanced (Recommended)</h4>
              <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Transforms bullet points using strong action verbs and incorporates keywords truthfully.</p>
          </div>

          <div
            onClick={() => setSelectedLevel('Aggressive')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedLevel === 'Aggressive'
                ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <h4 className="font-bold text-xs text-slate-800">Aggressive</h4>
            <p className="text-[11px] text-slate-500 mt-1">Maximum tailoring to job requirements while remaining 100% truthful.</p>
          </div>

        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <button
            onClick={onBackToJob}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            ← Modify Job Description
          </button>

          <button
            onClick={() => onStartOptimization(selectedLevel)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Optimize CV Now ({selectedLevel})</span>
          </button>
        </div>

      </div>

    </div>
  );
};
