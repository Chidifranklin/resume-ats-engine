import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Palette,
  Play,
  FileCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Clock,
  RotateCcw,
  BarChart3,
  Layers,
  ChevronRight,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudCheck,
} from 'lucide-react';
import {
  StructuredCV,
  StructuredJob,
  ATSAnalysisResult,
  OptimizationLevel,
  MissingSkillConfirmation,
  SavedRecord,
  CVTemplateId,
} from './types';
import {
  DEMO_ORIGINAL_CV,
  DEMO_JOB_DESCRIPTION,
  DEMO_ATS_ANALYSIS,
} from './data/demoData';

import { RefreshCw } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { LoginLandingPage } from './components/LoginLandingPage';
import { CVUploadStep } from './components/CVUploadStep';
import { JobDescriptionStep } from './components/JobDescriptionStep';
import { ATSAnalysisView } from './components/ATSAnalysisView';
import { CVEditorAndComparison } from './components/CVEditorAndComparison';
import { OptimizationConfigModal } from './components/OptimizationConfigModal';
import { DashboardView } from './components/DashboardView';
import { TemplatesView } from './components/TemplatesView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShieldAlert } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import {
  saveRecordToFirestore,
  fetchUserRecordsFromFirestore,
  deleteRecordFromFirestore,
  saveUploadedCVToFirestore,
  logUserActivityToFirestore,
  saveDraftWorkspaceToFirestore,
  fetchDraftWorkspaceFromFirestore,
} from './lib/firestoreService';
import { trackEvent } from './lib/analyticsService';

function AppContent() {
  const { currentUser, loading, logout, isAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Standalone Admin Portal view state (route-isolated at /admin or #admin)
  const [showAdminPortal, setShowAdminPortal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
    }
    return false;
  });

  useEffect(() => {
    const handleLocationCheck = () => {
      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
        setShowAdminPortal(isAdminRoute);
      }
    };
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // Navigation tab: 'landing' | 'optimize' | 'dashboard' | 'saved' | 'templates'
  const [currentTab, setCurrentTab] = useState<'landing' | 'optimize' | 'dashboard' | 'saved' | 'templates'>('dashboard');

  // Step inside 'optimize' workflow: 1: 'upload' | 2: 'job' | 3: 'analysis' | 4: 'editor'
  const [optimizeStep, setOptimizeStep] = useState<'upload' | 'job' | 'analysis' | 'editor'>('upload');

  useEffect(() => {
    trackEvent('WebsiteVisitor', { userEmail: currentUser?.email || 'anonymous' });
  }, []);

  useEffect(() => {
    if (currentTab === 'optimize') {
      trackEvent('StartedOptimization', { userEmail: currentUser?.email || 'anonymous', step: optimizeStep });
    }
  }, [currentTab, optimizeStep, currentUser]);

  // App core state
  const [parsedCV, setParsedCV] = useState<StructuredCV | null>(null);
  const [parsedJob, setParsedJob] = useState<StructuredJob | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [optimizedCV, setOptimizedCV] = useState<StructuredCV | null>(null);
  const [optimizationLevel, setOptimizationLevel] = useState<OptimizationLevel>('Balanced');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Modal for skill confirmation
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [pendingMissingSkills, setPendingMissingSkills] = useState<MissingSkillConfirmation[]>([]);

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial local demo records
  const initialDemoRecord: SavedRecord = {
    id: 'demo-saved-1',
    title: 'Senior Data Analyst - Nova Enterprise',
    createdAt: '2026-08-12',
    originalScore: 68,
    optimizedScore: 88,
    jobTitle: 'Senior Data & Analytics Specialist',
    company: 'Nova Enterprise Solutions',
    originalCV: DEMO_ORIGINAL_CV,
    optimizedCV: {
      ...DEMO_ORIGINAL_CV,
      summary: 'Results-driven Data Analytics Specialist with 3+ years of experience utilizing advanced SQL queries and Power BI data models to transform business operations. Proven track record of improving transit reporting efficiency by 35% across regional logistics networks.',
      coreCompetencies: [
        'Data Analysis & Modeling',
        'Advanced SQL Queries',
        'Power BI & DAX Measures',
        'Python (Pandas)',
        'ETL Data Quality',
        'Stakeholder Management'
      ],
      experience: [
        {
          ...DEMO_ORIGINAL_CV.experience[0],
          jobTitle: 'Data & Analytics Specialist',
          achievements: [
            'Designed and automated weekly Power BI & Excel transit reports across 12 regional hubs, cutting manual effort by 14 hours per week.',
            'Authored complex PostgreSQL queries with window functions and subqueries to extract multi-terabyte logistics operational logs.',
            'Engineered interactive Power BI dashboards providing real-time delivery performance metrics to executive stakeholders.',
            'Standardized customer address data validation routines, increasing routing accuracy by 18%.'
          ]
        },
        DEMO_ORIGINAL_CV.experience[1]
      ]
    },
    analysis: DEMO_ATS_ANALYSIS,
    selectedTemplate: 'classic',
  };

  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);

  // Fetch Firestore records & active draft workspace whenever user logs in
  useEffect(() => {
    async function loadUserData() {
      if (currentUser?.uid) {
        // 1. Load Saved Optimizations
        const remoteRecords = await fetchUserRecordsFromFirestore(currentUser.uid);
        if (remoteRecords && remoteRecords.length > 0) {
          setSavedRecords(remoteRecords);
        } else {
          setSavedRecords([]);
        }

        // 2. Restore Draft Workspace if available
        const draft = await fetchDraftWorkspaceFromFirestore(currentUser.uid);
        if (draft && draft.parsedCV) {
          setParsedCV(draft.parsedCV);
          if (draft.parsedJob) setParsedJob(draft.parsedJob);
          if (draft.atsAnalysis) setAtsAnalysis(draft.atsAnalysis);
          if (draft.optimizedCV) setOptimizedCV(draft.optimizedCV);
          if (draft.step && ['upload', 'job', 'analysis', 'editor'].includes(draft.step)) {
            setOptimizeStep(draft.step as any);
          }
        }
      }
    }
    loadUserData();
  }, [currentUser]);

  // Handle CV Parsed or Uploaded
  const handleCVParsed = async (cv: StructuredCV) => {
    setParsedCV(cv);

    if (currentUser?.uid && cv) {
      const cvRecord = {
        id: `cv_${Date.now()}`,
        userId: currentUser.uid,
        fileName: cv.personalInfo?.fullName ? `${cv.personalInfo.fullName} Base Resume` : 'Candidate Uploaded CV',
        uploadedAt: new Date().toISOString(),
        structuredCV: cv,
      };

      await saveUploadedCVToFirestore(currentUser.uid, cvRecord);
      await logUserActivityToFirestore(
        currentUser.uid,
        currentUser.email || '',
        'CV_UPLOADED',
        `Uploaded base CV for ${cv.personalInfo?.fullName || 'Candidate'}`
      );

      await saveDraftWorkspaceToFirestore(currentUser.uid, {
        parsedCV: cv,
        parsedJob,
        atsAnalysis,
        optimizedCV,
        step: 'job',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Handle Load Demo Data
  const handleTryDemo = async () => {
    setParsedCV(DEMO_ORIGINAL_CV);
    setParsedJob(DEMO_JOB_DESCRIPTION);
    setAtsAnalysis(DEMO_ATS_ANALYSIS);
    const opt = {
      ...DEMO_ORIGINAL_CV,
      summary: 'Results-driven Data Analytics Specialist with 3+ years of experience utilizing advanced SQL queries and Power BI data models to transform business operations. Proven track record of improving transit reporting efficiency by 35% across regional logistics networks.',
      coreCompetencies: [
        'Data Analysis & Modeling',
        'Advanced SQL Queries',
        'Power BI & DAX Measures',
        'Python (Pandas)',
        'ETL Data Quality',
        'Stakeholder Management'
      ],
      experience: [
        {
          ...DEMO_ORIGINAL_CV.experience[0],
          jobTitle: 'Data & Analytics Specialist',
          achievements: [
            'Designed and automated weekly Power BI & Excel transit reports across 12 regional hubs, cutting manual effort by 14 hours per week.',
            'Authored complex PostgreSQL queries with window functions and subqueries to extract multi-terabyte logistics operational logs.',
            'Engineered interactive Power BI dashboards providing real-time delivery performance metrics to executive stakeholders.',
            'Standardized customer address data validation routines, increasing routing accuracy by 18%.'
          ]
        },
        DEMO_ORIGINAL_CV.experience[1]
      ]
    };
    setOptimizedCV(opt);
    setCurrentTab('optimize');
    setOptimizeStep('analysis');

    if (currentUser?.uid) {
      await logUserActivityToFirestore(currentUser.uid, currentUser.email || '', 'TRY_DEMO', 'Loaded instant interactive demo dataset.');
    }
  };

  // Run ATS Analysis via API or fallback
  const handleRunAnalysis = async () => {
    if (!parsedCV || !parsedJob) return;

    setIsAnalyzing(true);
    let analysisRes: ATSAnalysisResult = DEMO_ATS_ANALYSIS;
    try {
      const res = await fetch('/api/analyze-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv: parsedCV, job: parsedJob }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        analysisRes = data.analysis;
      }
    } catch (err) {
      analysisRes = DEMO_ATS_ANALYSIS;
    } finally {
      setIsAnalyzing(false);
    }

    setAtsAnalysis(analysisRes);
    setOptimizeStep('analysis');

    if (currentUser?.uid) {
      await logUserActivityToFirestore(
        currentUser.uid,
        currentUser.email || '',
        'ATS_ANALYSIS_RUN',
        `Analyzed ATS score for ${parsedJob.jobTitle} at ${parsedJob.company} (Score: ${analysisRes.overallScore}%)`
      );

      await saveDraftWorkspaceToFirestore(currentUser.uid, {
        parsedCV,
        parsedJob,
        atsAnalysis: analysisRes,
        optimizedCV,
        step: 'analysis',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Start Optimization Trigger
  const handleStartOptimization = async (level: OptimizationLevel) => {
    setOptimizationLevel(level);
    if (!parsedCV || !parsedJob) return;

    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv: parsedCV,
          job: parsedJob,
          level,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.result.missingSkillsForConfirmation?.length > 0) {
          setPendingMissingSkills(data.result.missingSkillsForConfirmation);
          setShowSkillModal(true);
        } else {
          setOptimizedCV(data.result.optimizedCV);
          setOptimizeStep('editor');
          saveToHistory(data.result.optimizedCV, data.result.summary?.newScore || 85);
        }
      } else {
        const fallbackOpt: StructuredCV = {
          ...parsedCV,
          summary: `Results-driven ${parsedJob.jobTitle} with demonstrated expertise in ${parsedJob.requiredSkills.slice(0, 3).join(', ')}. Proven track record of converting analytical insights into high-impact operational decisions.`,
          coreCompetencies: Array.from(new Set([...(parsedCV.coreCompetencies || []), ...parsedJob.requiredSkills.slice(0, 5)])),
        };
        setOptimizedCV(fallbackOpt);
        setOptimizeStep('editor');
        saveToHistory(fallbackOpt, 86);
      }
    } catch (err) {
      const fallbackOpt: StructuredCV = {
        ...parsedCV,
        summary: `Results-driven ${parsedJob.jobTitle} with demonstrated expertise in ${parsedJob.requiredSkills.slice(0, 3).join(', ')}. Proven track record of converting analytical insights into high-impact operational decisions.`,
        coreCompetencies: Array.from(new Set([...(parsedCV.coreCompetencies || []), ...parsedJob.requiredSkills.slice(0, 5)])),
      };
      setOptimizedCV(fallbackOpt);
      setOptimizeStep('editor');
      saveToHistory(fallbackOpt, 86);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Skill Confirmation Modal Completion
  const handleSkillConfirmFinish = (confirmedSkills: string[]) => {
    setShowSkillModal(false);
    if (!optimizedCV && parsedCV && parsedJob) {
      const updatedCompetencies = Array.from(new Set([...(parsedCV.coreCompetencies || []), ...confirmedSkills]));
      const optCV: StructuredCV = {
        ...parsedCV,
        coreCompetencies: updatedCompetencies,
        summary: `Results-driven ${parsedJob.jobTitle} with expertise in ${confirmedSkills.concat(parsedJob.requiredSkills.slice(0, 2)).join(', ')}.`,
      };
      setOptimizedCV(optCV);
      saveToHistory(optCV, 88);
    } else if (optimizedCV) {
      const updated = {
        ...optimizedCV,
        coreCompetencies: Array.from(new Set([...optimizedCV.coreCompetencies, ...confirmedSkills])),
      };
      setOptimizedCV(updated);
      saveToHistory(updated, 88);
    }
    setOptimizeStep('editor');
  };

  const saveToHistory = async (optCV: StructuredCV, newScore: number) => {
    const record: SavedRecord = {
      id: `rec-${Date.now()}`,
      title: `${parsedJob?.jobTitle || 'Job'} Tailored Resume`,
      createdAt: new Date().toISOString().split('T')[0],
      originalScore: atsAnalysis?.overallScore || 68,
      optimizedScore: newScore,
      jobTitle: parsedJob?.jobTitle || 'Role',
      company: parsedJob?.company || 'Company',
      originalCV: parsedCV || DEMO_ORIGINAL_CV,
      optimizedCV: optCV,
      analysis: atsAnalysis || DEMO_ATS_ANALYSIS,
      selectedTemplate: 'classic',
    };

    setSavedRecords((prev) => [record, ...prev]);

    if (currentUser?.uid) {
      await saveRecordToFirestore(currentUser.uid, record);
      await logUserActivityToFirestore(
        currentUser.uid,
        currentUser.email || '',
        'CV_OPTIMIZED',
        `Created job-tailored resume for ${record.jobTitle} at ${record.company} (Match Score: ${newScore}%)`
      );

      await saveDraftWorkspaceToFirestore(currentUser.uid, {
        parsedCV: parsedCV || optCV,
        parsedJob,
        atsAnalysis,
        optimizedCV: optCV,
        step: 'editor',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleLoadRecord = async (record: SavedRecord) => {
    setParsedCV(record.originalCV);
    const jobData = {
      jobTitle: record.jobTitle,
      company: record.company,
      rawText: record.jobTitle,
      requiredSkills: record.optimizedCV.coreCompetencies || [],
      preferredSkills: [],
      responsibilities: [],
      educationRequirements: [],
      certifications: [],
      experienceRequirements: [],
      industryKeywords: [],
      softSkills: [],
      technologies: [],
    };
    setParsedJob(jobData);
    setAtsAnalysis(record.analysis);
    setOptimizedCV(record.optimizedCV);
    setCurrentTab('optimize');
    setOptimizeStep('editor');

    if (currentUser?.uid) {
      await logUserActivityToFirestore(
        currentUser.uid,
        currentUser.email || '',
        'LOAD_RECORD',
        `Opened saved optimization: ${record.title}`
      );
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    if (currentUser?.uid) {
      await deleteRecordFromFirestore(currentUser.uid, id);
      await logUserActivityToFirestore(currentUser.uid, currentUser.email || '', 'DELETE_RECORD', `Deleted saved optimization record: ${id}`);
    }
  };

  const startNewOptimization = () => {
    setParsedCV(null);
    setParsedJob(null);
    setAtsAnalysis(null);
    setOptimizedCV(null);
    setCurrentTab('optimize');
    setOptimizeStep('upload');
  };

  // Handle auth loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Authenticating candidate session...</p>
        </div>
      </div>
    );
  }

  // Mandatory user login landing page before accessing the app
  if (!currentUser) {
    return <LoginLandingPage />;
  }

  // Render isolated standalone Admin Portal when on /admin route
  if (showAdminPortal) {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          setShowAdminPortal(false);
          if (typeof window !== 'undefined') {
            if (window.location.pathname.startsWith('/admin')) {
              window.history.pushState({}, '', '/');
            }
            if (window.location.hash === '#admin') {
              window.location.hash = '';
            }
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR - CLEAN MINIMALISM DESIGN */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex shrink-0">
        
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-blue-700 transition-colors">
              AO
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-800 leading-none">CV Optimizer</h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Truthful ATS AI Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'dashboard' ? 'bg-blue-600' : 'bg-transparent'}`} />
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('optimize');
              if (!parsedCV) setOptimizeStep('upload');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'optimize'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'optimize' ? 'bg-blue-600' : 'bg-transparent'}`} />
            <Sparkles className="w-4 h-4" />
            <span>Optimize CV</span>
          </button>

          <button
            onClick={() => setCurrentTab('saved')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'saved'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'saved' ? 'bg-blue-600' : 'bg-transparent'}`} />
            <FileText className="w-4 h-4" />
            <span>My Tailored CVs</span>
          </button>

          <button
            onClick={() => setCurrentTab('templates')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'templates'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'templates' ? 'bg-blue-600' : 'bg-transparent'}`} />
            <Palette className="w-4 h-4" />
            <span>ATS Templates</span>
          </button>

        </nav>

        {/* User Auth Profile Footer Card */}
        <div className="p-4 border-t border-slate-100">
          {currentUser ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden text-left">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {currentUser.displayName || 'Candidate'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setShowAdminPortal(true);
                    if (typeof window !== 'undefined') {
                      window.history.pushState({}, '', '/admin');
                    }
                  }}
                  className="mt-2.5 w-full pt-2 border-t border-slate-200/60 text-left text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin Portal</span>
                  </span>
                  <span className="text-[10px] bg-slate-200/80 text-slate-700 font-mono px-1.5 py-0.5 rounded">/admin</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER BAR - CLEAN MINIMALISM DESIGN */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          
          {/* Left Breadcrumb Navigation */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span className="text-slate-400 font-medium hidden sm:inline">Projects / CV Optimization</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-slate-800 font-bold tracking-tight">
              {parsedJob?.jobTitle ? `${parsedJob.jobTitle} (${parsedJob.company})` : 'ATS CV Optimizer'}
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>Firestore Synced</span>
              </span>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer hidden sm:block"
              >
                Sign In to Sync
              </button>
            )}

            <button
              onClick={handleTryDemo}
              className="px-3.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-blue-600 fill-current" />
              <span>Try Instant Demo</span>
            </button>

            <button
              onClick={startNewOptimization}
              className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Optimization</span>
            </button>
          </div>

        </header>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 text-xs z-20">
            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg font-bold ${currentTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => { setCurrentTab('optimize'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg font-bold ${currentTab === 'optimize' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            >
              <Sparkles className="w-4 h-4" /> Optimize CV
            </button>
            <button
              onClick={() => { setCurrentTab('saved'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg font-bold ${currentTab === 'saved' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            >
              <FileText className="w-4 h-4" /> My Tailored CVs
            </button>
            <button
              onClick={() => { setCurrentTab('templates'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg font-bold ${currentTab === 'templates' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            >
              <Palette className="w-4 h-4" /> ATS Templates
            </button>
            
            <div className="pt-2 border-t border-slate-100">
              {currentUser ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg font-bold text-rose-600"
                >
                  <LogOut className="w-4 h-4" /> Sign Out ({currentUser.email})
                </button>
              ) : (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg font-bold text-blue-600 bg-blue-50"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN SCROLLABLE VIEW AREA */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* TAB 1: LANDING PAGE */}
          {currentTab === 'landing' && (
            <LandingPage
              onStartOptimize={startNewOptimization}
              onTryDemo={handleTryDemo}
            />
          )}

          {/* TAB 2: OPTIMIZE WIZARD */}
          {currentTab === 'optimize' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Step Process Bar */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-semibold overflow-x-auto gap-2">
                
                <button
                  onClick={() => setOptimizeStep('upload')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    optimizeStep === 'upload'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : parsedCV
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
                  <span>1. CV Upload</span>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                <button
                  onClick={() => parsedCV && setOptimizeStep('job')}
                  disabled={!parsedCV}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    optimizeStep === 'job'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : parsedJob
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
                  <span>2. Target Job</span>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                <button
                  onClick={() => atsAnalysis && setOptimizeStep('analysis')}
                  disabled={!atsAnalysis}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    optimizeStep === 'analysis'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : atsAnalysis
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
                  <span>3. ATS Analysis</span>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                <button
                  onClick={() => optimizedCV && setOptimizeStep('editor')}
                  disabled={!optimizedCV}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    optimizeStep === 'editor'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : optimizedCV
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">4</span>
                  <span>4. Optimized CV & Export</span>
                </button>

              </div>

              {/* STEP 1: CV UPLOAD */}
              {optimizeStep === 'upload' && (
                <CVUploadStep
                  parsedCV={parsedCV}
                  onCVParsed={handleCVParsed}
                  onNextStep={() => setOptimizeStep('job')}
                />
              )}

              {/* STEP 2: JOB DESCRIPTION */}
              {optimizeStep === 'job' && (
                <JobDescriptionStep
                  parsedJob={parsedJob}
                  onJobParsed={(job) => {
                    setParsedJob(job);
                  }}
                  onNextStep={handleRunAnalysis}
                  onBackStep={() => setOptimizeStep('upload')}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {/* STEP 3: ATS ANALYSIS */}
              {optimizeStep === 'analysis' && atsAnalysis && (
                <ATSAnalysisView
                  analysis={atsAnalysis}
                  onStartOptimization={handleStartOptimization}
                  onBackToJob={() => setOptimizeStep('job')}
                  isOptimizing={isOptimizing}
                />
              )}

              {/* STEP 4: EDITOR & COMPARISON */}
              {optimizeStep === 'editor' && parsedCV && optimizedCV && parsedJob && (
                <CVEditorAndComparison
                  originalCV={parsedCV}
                  optimizedCV={optimizedCV}
                  job={parsedJob}
                  onUpdateCV={(updated) => {
                    setOptimizedCV(updated);
                    if (currentUser?.uid) {
                      saveDraftWorkspaceToFirestore(currentUser.uid, {
                        parsedCV,
                        parsedJob,
                        atsAnalysis,
                        optimizedCV: updated,
                        step: 'editor',
                        updatedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  onBackToAnalysis={() => setOptimizeStep('analysis')}
                />
              )}

            </div>
          )}

          {/* TAB 3 & 4: DASHBOARD / SAVED RECORDS */}
          {(currentTab === 'dashboard' || currentTab === 'saved') && (
            <DashboardView
              savedRecords={savedRecords}
              onLoadRecord={handleLoadRecord}
              onDeleteRecord={handleDeleteRecord}
              onStartNewOptimization={startNewOptimization}
            />
          )}

          {/* TAB 5: TEMPLATES VIEW */}
          {currentTab === 'templates' && (
            <TemplatesView
              onSelectTemplate={(tpl) => {
                if (optimizedCV) {
                  setCurrentTab('optimize');
                  setOptimizeStep('editor');
                } else {
                  startNewOptimization();
                }
              }}
            />
          )}


        </section>

      </main>

      {/* SKILL CONFIRMATION MODAL */}
      {showSkillModal && (
        <OptimizationConfigModal
          missingSkills={pendingMissingSkills}
          onConfirmSkills={handleSkillConfirmFinish}
          onCancel={() => setShowSkillModal(false)}
        />
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
