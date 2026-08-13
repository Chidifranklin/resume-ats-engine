import React from 'react';
import {
  Sparkles,
  Play,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Target,
  FileDown,
  ArrowRight,
  Zap,
  Lock,
  Search,
  Sliders,
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onStartOptimize: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartOptimize, onTryDemo }) => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto text-slate-900 pb-12">
      
      {/* HERO BANNER - CLEAN MINIMALISM */}
      <section className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI ATS Compatibility & Job-Tailored Resume Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Optimize Your CV for ATS & <span className="text-blue-600">Land More Interviews</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Upload your CV and target job description. Our AI analyzes job requirements, flags missing keywords, and transforms your resume into an ATS-optimized document while guaranteeing 100% truthful career experience.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onStartOptimize}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
            >
              <span>Optimize My CV</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 text-blue-600 fill-current" />
              <span>Try Instant Demo</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Anti-Hallucination Truth Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>DOCX & Searchable PDF Downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-slate-600" />
              <span>Weighted 7-Dimension ATS Scoring</span>
            </div>
          </div>

        </div>
      </section>

      {/* SAMPLE ATS SCORE PREVIEW SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Real ATS Matching Architecture
          </h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            Benchmarks your resume against 7 recruiter screening dimensions before enterprise ATS parsers see it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Keyword & Skill Extraction</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Categorizes matched, partial, and missing keywords from job postings. Identifies missing technical competencies and soft skills.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">3-Level Tailored Rewriting</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Choose Conservative, Balanced, or Aggressive optimization. Transforms weak duty descriptions into high-impact action statements.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">ATS-Friendly Document Export</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Exports clean, single-column Microsoft Word (.docx) files and searchable PDFs formatted to pass enterprise parser filters.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS WORKFLOW */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">Workflow</span>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">
            How The ATS CV Optimizer Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">1. Upload Your CV</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Drag and drop your PDF or DOCX file. Our parser extracts all structured work history and facts.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">2. Provide Target Job</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Paste the job description text or document. AI extracts core qualifications and responsibilities.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">3. Run ATS Analysis</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              View your estimated ATS Match Score, keyword status matrix, skills gap breakdown, and recruiter insights.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">4. Optimize & Export</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Tailor achievements with AI, confirm skills, fine-tune using our editor, and download Word or PDF documents.
            </p>
          </div>

        </div>

        <div className="text-center pt-2">
          <button
            onClick={onStartOptimize}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Free Optimization</span>
          </button>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Privacy & Anti-Hallucination Commitment</h3>
        <p className="text-slate-500 text-xs max-w-xl mx-auto leading-relaxed">
          Your career documents are parsed securely on server-side isolated memory. We strictly enforce guardrails that prevent AI models from making up fake employment history, dates, degrees, or revenue numbers.
        </p>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm">Does the AI fabricate fake employment history?</h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              No. The AI is strictly bounded by anti-hallucination protocols. It only rephrases and highlights your genuine experience using strong action verbs and relevant terminology. If a required skill is missing, it will ask for your explicit confirmation before adding it.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm">Will my exported document be ATS readable?</h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Yes. Both exported DOCX and PDF files use single-column layouts, standard web-safe typography, clear section headers, and standard bullet formatting to ensure smooth parsing by Workday, Taleo, Greenhouse, and Lever ATS systems.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm">Is the ATS Compatibility Score exact?</h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              The score is an estimated compatibility score calculated using industry-standard recruiter weighting (keywords, technical skills, experience alignment, formatting). Actual ATS implementations vary by company and platform settings.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
