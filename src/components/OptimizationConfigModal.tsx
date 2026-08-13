import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, SkipForward, Sparkles } from 'lucide-react';
import { MissingSkillConfirmation } from '../types';

interface OptimizationConfigModalProps {
  missingSkills: MissingSkillConfirmation[];
  onConfirmSkills: (confirmedSkills: string[]) => void;
  onCancel: () => void;
}

export const OptimizationConfigModal: React.FC<OptimizationConfigModalProps> = ({
  missingSkills,
  onConfirmSkills,
  onCancel,
}) => {
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'skip'>>({});

  const handleSelect = (skill: string, choice: 'yes' | 'no' | 'skip') => {
    setAnswers((prev) => ({ ...prev, [skill]: choice }));
  };

  const handleFinish = () => {
    const confirmed = Object.entries(answers)
      .filter(([_, choice]) => choice === 'yes')
      .map(([skill]) => skill);
    onConfirmSkills(confirmed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded w-fit">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Skill Confirmation Check</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-2">Do you possess any of these target skills?</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              To guarantee 100% truthful experience, we only include skills you explicitly confirm.
            </p>
          </div>
        </div>

        {/* Missing Skills Questionnaire List */}
        {missingSkills.length === 0 ? (
          <p className="text-xs text-slate-600">No missing skills detected for confirmation. Proceeding to optimization.</p>
        ) : (
          <div className="space-y-3">
            {missingSkills.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 text-xs">{item.skill}</span>
                    <span className="ml-2 text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {item.category}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
                  </div>
                </div>

                {/* Choice Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelect(item.skill, 'yes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      answers[item.skill] === 'yes'
                        ? 'bg-green-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Yes, add it</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(item.skill, 'no')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      answers[item.skill] === 'no'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>No</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(item.skill, 'skip')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      answers[item.skill] === 'skip'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Generate Optimized CV</span>
          </button>
        </div>

      </div>
    </div>
  );
};
