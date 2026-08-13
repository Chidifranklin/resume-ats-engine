/**
 * ATS CV Optimizer - Core TypeScript Data Schemas
 */

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  achievements: string[];
  technologies: string[];
  link?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  location?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  credentialId?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface StructuredCV {
  id?: string;
  title?: string;
  personalInfo: PersonalInfo;
  summary: string;
  coreCompetencies: string[];
  technicalSkills: SkillCategory[] | string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  additionalInformation: string[];
  rawText?: string;
}

export interface StructuredJob {
  id?: string;
  jobTitle: string;
  company: string;
  rawText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  educationRequirements: string[];
  certifications: string[];
  experienceRequirements: string[];
  industryKeywords: string[];
  softSkills: string[];
  technologies: string[];
}

export type KeywordStatus = 'MATCHED' | 'PARTIAL' | 'MISSING';

export interface KeywordAnalysisItem {
  keyword: string;
  importance: 'Required' | 'Preferred' | 'Bonus';
  status: KeywordStatus;
  evidence: string;
  recommendation: string;
}

export interface DimensionScores {
  keywordScore: number;     // max 25
  skillsScore: number;      // max 20
  experienceScore: number;  // max 20
  educationScore: number;   // max 10
  jobTitleScore: number;    // max 10
  achievementsScore: number;// max 5
  formattingScore: number;  // max 10
}

export interface ATSAnalysisResult {
  id?: string;
  overallScore: number; // 0 - 100
  matchLabel: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Weak Match';
  dimensionScores: DimensionScores;
  keywordAnalysis: KeywordAnalysisItem[];
  skillsAnalysis: {
    matched: string[];
    partial: string[];
    missing: string[];
  };
  experienceAnalysis: {
    matchLevel: 'Strong' | 'Moderate' | 'Weak';
    details: string[];
    missingRequirements: string[];
  };
  educationAnalysis: {
    matchLevel: 'Strong' | 'Moderate' | 'Weak';
    details: string;
  };
  certificationAnalysis: {
    matchLevel: 'Strong' | 'Moderate' | 'Weak';
    details: string;
  };
  formattingAnalysis: {
    isSingleColumn: boolean;
    hasTablesOrGraphics: boolean;
    issues: string[];
    score: number;
  };
  topImprovements: string[];
  remainingGaps: string[];
  recommendations: string[];
  recruiterView: {
    strengths: string[];
    gaps: string[];
    summary: string;
  };
  createdAt?: string;
}

export type OptimizationLevel = 'Conservative' | 'Balanced' | 'Aggressive';

export interface MissingSkillConfirmation {
  skill: string;
  category: string;
  reason: string;
}

export interface OptimizationSummary {
  originalScore: number;
  newScore: number;
  improvementDelta: number;
  changesSummary: string[];
  addedKeywords: string[];
  rewrittenSections: string[];
}

export interface OptimizedCVResult {
  id?: string;
  optimizedCV: StructuredCV;
  summary: OptimizationSummary;
  missingSkillsForConfirmation: MissingSkillConfirmation[];
  createdAt?: string;
}

export type CVTemplateId = 'classic' | 'modern' | 'corporate' | 'technical' | 'executive';

export interface SavedRecord {
  id: string;
  title: string;
  createdAt: string;
  originalScore: number;
  optimizedScore: number;
  jobTitle: string;
  company: string;
  originalCV: StructuredCV;
  optimizedCV: StructuredCV;
  analysis: ATSAnalysisResult;
  selectedTemplate: CVTemplateId;
}

// ==========================================
// ADMIN & ANALYTICS DATA TYPES
// ==========================================

export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';

export type SubscriptionPlan = 'FREE' | 'TRIAL' | 'PREMIUM';

export interface UserAccountItem {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  plan: SubscriptionPlan;
  createdAt: string;
  lastActiveAt: string;
  cvsUploadedCount: number;
  cvsOptimizedCount: number;
  downloadsCount: number;
  country?: string;
  device?: string;
}

export type AdminTab =
  | 'overview'
  | 'users'
  | 'cv-ats'
  | 'jobs-skills'
  | 'ai-center'
  | 'revenue'
  | 'system-health'
  | 'security'
  | 'audit-logs'
  | 'settings';

export type DateFilterOption = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'year' | 'all';

export interface NorthStarMetrics {
  totalUsers: number;
  newUsers: number;
  dau: number;
  wau: number;
  mau: number;
  returningUsers: number;
  retentionRateDay30: number;
  churnRate: number;
  cvsUploaded: number;
  cvsParsed: number;
  cvsAnalyzed: number;
  cvsOptimized: number;
  cvsDownloaded: number;
  parsingSuccessRate: number;
  optimizationSuccessRate: number;
  downloadRate: number;
  avgInitialScore: number;
  avgOptimizedScore: number;
  avgScoreImprovement: number;
  optimizationCompletionRate: number; // Primary Metric
  aiCostPerOptimization: number;
}

export interface FunnelStageItem {
  stage: string;
  users: number;
  conversionRate: number; // %
  dropoffRate: number;   // %
}

export interface ScoreDistribution {
  range0_20: number;
  range21_40: number;
  range41_60: number;
  range61_80: number;
  range81_100: number;
}

export interface JobSkillAnalytics {
  topJobTitles: { title: string; count: number }[];
  topIndustries: { industry: string; count: number }[];
  topRequiredSkills: { skill: string; count: number }[];
  topMatchedSkills: { skill: string; count: number }[];
  topMissingSkills: { skill: string; count: number }[];
  topPartialSkills: { skill: string; count: number }[];
}

export interface TemplateUsageStats {
  templateId: CVTemplateId;
  name: string;
  views: number;
  selections: number;
  downloads: number;
  conversionRate: number;
}

export interface AIUsageMetrics {
  totalRequests: number;
  parsingRequests: number;
  jobRequests: number;
  atsRequests: number;
  optimizationRequests: number;
  regenerationRequests: number;
  successfulRequests: number;
  failedRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  model: string;
  estimatedCost: number; // USD
  costPerOptimization: number;
  costAlertThresholdDaily: number;
  costAlertTriggered: boolean;
}

export interface SystemHealthMetrics {
  appStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  dbStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  aiApiStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  storageStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  appUptimePercent: number;
  apiLatencyMs: number;
  dbLatencyMs: number;
  aiLatencyMs: number;
  storageUsageMb: number;
  storageMaxMb: number;
  memoryUsageMb: number;
  errorRate4xx: number;
  errorRate5xx: number;
  activeAlerts: string[];
}

export interface SecurityEventItem {
  id: string;
  type:
    | 'FAILED_LOGIN'
    | 'RATE_LIMIT_EXCEEDED'
    | 'UNAUTHORIZED_API'
    | 'PROMPT_INJECTION_ATTEMPT'
    | 'INVALID_FILE_UPLOAD'
    | 'MALICIOUS_FILE_ATTEMPT'
    | 'ACCOUNT_LOCKOUT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userEmail?: string;
  ipAddress: string;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  adminEmail: string;
  action:
    | 'USER_VIEWED'
    | 'USER_SUSPENDED'
    | 'USER_REACTIVATED'
    | 'USER_DELETED'
    | 'CV_DELETED'
    | 'CONFIG_CHANGED'
    | 'AI_ALERT_THRESHOLD_UPDATED'
    | 'ROLE_CHANGED';
  resource: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  freeUsersCount: number;
  trialUsersCount: number;
  premiumUsersCount: number;
  activeSubscriptions: number;
  newSubscriptionsThisMonth: number;
  cancellationsThisMonth: number;
  monthlyRevenueToday: number;
  monthlyRevenueThisWeek: number;
  monthlyRevenueThisMonth: number;
}

