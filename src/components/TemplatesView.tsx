import React from 'react';
import { Palette, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CVTemplateId } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (templateId: CVTemplateId) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const templates: Array<{
    id: CVTemplateId;
    title: string;
    description: string;
    font: string;
    accent: string;
    features: string[];
  }> = [
    {
      id: 'classic',
      title: 'Classic Professional',
      description: 'Clean Times New Roman layout with centered header borders. Preferred by traditional corporate, banking, and government recruiters.',
      font: 'Times New Roman',
      accent: 'border-slate-800 text-slate-900',
      features: ['Centered Header', 'Serif Typography', '100% ATS Workday Compatible', 'Single Column'],
    },
    {
      id: 'modern',
      title: 'Modern Minimal',
      description: 'Left-aligned crisp Calibri layout with deep navy accents. Ideal for Tech, Data, Marketing, and Product roles.',
      font: 'Calibri / Sans-Serif',
      accent: 'border-blue-700 text-blue-900',
      features: ['Left-Aligned Header', 'Navy Section Dividers', 'High Contrast Spacing', 'Single Column'],
    },
    {
      id: 'corporate',
      title: 'Corporate',
      description: 'Authoritative Arial font styling designed for management, operations, finance, and enterprise consulting.',
      font: 'Arial',
      accent: 'border-slate-900 text-slate-900',
      features: ['Bold Section Rules', 'Clean Line Margins', 'Compact Density', 'Taleo Parser Ready'],
    },
    {
      id: 'technical',
      title: 'Technical',
      description: 'Focuses heavily on technical skills, developer toolchains, coding projects, and architecture achievements.',
      font: 'Arial / System Mono',
      accent: 'border-green-700 text-green-900',
      features: ['Skills Grouping First', 'Toolchain Highlighting', 'Project Focus', 'Greenhouse Verified'],
    },
    {
      id: 'executive',
      title: 'Executive',
      description: 'Refined Georgia typography suited for senior leadership, directors, VPs, and C-suite candidates.',
      font: 'Georgia',
      accent: 'border-slate-900 text-slate-900',
      features: ['Executive Summary Box', 'Leadership Focus', 'High Typography Scale', 'Lever Parser Ready'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded w-fit">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>ATS Document Templates</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-2">
          Select ATS-Friendly Resume Template
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          All templates strictly follow enterprise ATS single-column formatting rules, avoiding text boxes, tables, images, or skill bars that cause parser errors.
        </p>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {tpl.font}
                </span>
                <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ATS Verified
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-lg">{tpl.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{tpl.description}</p>

              {/* Feature checklist */}
              <div className="space-y-1 pt-2">
                {tpl.features.map((feat, fi) => (
                  <div key={fi} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectTemplate(tpl.id)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Use {tpl.title} Template
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
