import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Sparkles,
  TrendingUp,
  Briefcase,
  FileText,
  ArrowRight,
  Trash2,
  Clock,
  Activity,
  History,
  CheckCircle2,
} from 'lucide-react';
import { SavedRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserActivitiesFromFirestore,
  UserActivityRecord,
} from '../lib/firestoreService';

interface DashboardViewProps {
  savedRecords: SavedRecord[];
  onLoadRecord: (record: SavedRecord) => void;
  onDeleteRecord: (id: string) => void;
  onStartNewOptimization: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedRecords,
  onLoadRecord,
  onDeleteRecord,
  onStartNewOptimization,
}) => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<UserActivityRecord[]>([]);

  useEffect(() => {
    async function loadActivities() {
      if (currentUser?.uid) {
        const acts = await fetchUserActivitiesFromFirestore(currentUser.uid);
        setActivities(acts);
      }
    }
    loadActivities();
  }, [currentUser, savedRecords]);

  const totalAnalyzed = savedRecords.length;
  const avgScore =
    savedRecords.length > 0
      ? Math.round(
          savedRecords.reduce((acc, r) => acc + r.optimizedScore, 0) / savedRecords.length
        )
      : 88;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Candidate Optimization Dashboard
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage saved tailored resume versions, review stored CVs, and inspect activity history.
          </p>
        </div>

        <button
          onClick={onStartNewOptimization}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>New CV Optimization</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CVs Analyzed
            </span>
            <span className="text-xl font-bold text-slate-800">{totalAnalyzed || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CVs Tailored
            </span>
            <span className="text-xl font-bold text-slate-800">{totalAnalyzed || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Match Score
            </span>
            <span className="text-xl font-bold text-slate-800">
              {savedRecords.length > 0 ? `${avgScore}%` : '--'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Activities Saved
            </span>
            <span className="text-xl font-bold text-slate-800">{activities.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Saved Records + Recent Activity Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Records Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Saved Tailored Resumes</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {savedRecords.length} Saved
            </span>
          </div>

          {savedRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">
                No saved optimization records yet.
              </p>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Upload your CV and enter a target job description to build your first tailored resume.
              </p>
              <button
                onClick={onStartNewOptimization}
                className="mt-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
              >
                Start Optimization
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {savedRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px]">
                        {rec.company}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Job Target: <span className="font-semibold text-slate-700">{rec.jobTitle}</span>{' '}
                      • Saved on {rec.createdAt}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] pt-0.5">
                      <span className="text-slate-400">
                        Original Score: <strong className="text-slate-700">{rec.originalScore}</strong>
                      </span>
                      <span className="text-green-600 font-bold">
                        Optimized Score: {rec.optimizedScore} (+{rec.optimizedScore - rec.originalScore})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadRecord(rec)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View & Export</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Trail Side Panel (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Activity & Audit History</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-bold text-slate-500 px-2 py-0.5 rounded">
              Firestore Log
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3 text-xs">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <History className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No recent activity logged.</p>
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{act.action.replace(/_/g, ' ')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {act.details && (
                    <p className="text-slate-600 text-[11px] pl-5">{act.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
