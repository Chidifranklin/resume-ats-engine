/**
 * Express Backend Server for ATS CV Optimizer
 * Hosts API endpoints for CV Parsing, ATS Analysis, AI Optimization, and Document Exporting.
 * Integrates Vite middleware in development mode and static file serving in production mode.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import mammoth from 'mammoth';
import {
  parseCVFromText,
  extractJobRequirementsFromText,
  analyzeATS,
  optimizeCV,
  regenerateCVSection,
} from './src/lib/gemini';
import { generateDocxBlob } from './src/lib/docx-generator';
import { generatePDFBlob } from './src/lib/pdf-generator';
import { normalizeCV } from './src/lib/cvNormalizer';
import { CVTemplateId, OptimizationLevel, DateFilterOption } from './src/types';
import { adminDataStore } from './src/lib/adminDataStore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with higher limit for file base64 payloads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ATS CV Optimizer API' });
  });

  // Analytics Event Ingestion
  app.post('/api/track-event', (req: Request, res: Response) => {
    try {
      const { eventName, metadata } = req.body;
      if (eventName) {
        adminDataStore.recordEvent(eventName, metadata || {});
      }
      res.json({ success: true });
    } catch (_) {
      res.status(500).json({ error: 'Failed to log event' });
    }
  });

  // --- PROTECTED ADMIN API ENDPOINTS ---

  // Admin Auth Middleware Guard
  const verifyAdminAuth = (req: Request, res: Response, next: express.NextFunction) => {
    // Check role or header permission
    const roleHeader = req.headers['x-user-role'];
    const adminKey = req.headers['x-admin-key'];
    // By default, allow admin operations if role is ADMIN or during dashboard interactions
    if (roleHeader === 'USER' && adminKey !== 'admin-secret') {
      return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
    }
    next();
  };

  // 1. Admin Overview & North Star KPIs
  app.get('/api/admin/overview', verifyAdminAuth, (req: Request, res: Response) => {
    const timeframe = (req.query.timeframe as DateFilterOption) || '30d';
    const northStar = adminDataStore.getNorthStarMetrics(timeframe);
    const funnel = adminDataStore.getConversionFunnel();
    const scores = adminDataStore.getScoreDistribution();
    const systemHealth = adminDataStore.getSystemHealth();
    const aiUsage = adminDataStore.getAIUsage();

    res.json({
      success: true,
      timeframe,
      northStar,
      funnel,
      scores,
      systemHealth,
      aiUsage,
    });
  });

  // 2. Admin User Management
  app.get('/api/admin/users', verifyAdminAuth, (req: Request, res: Response) => {
    const { search, role, status } = req.query;
    const users = adminDataStore.getAllUsers(
      search as string,
      role as string,
      status as string
    );
    res.json({ success: true, count: users.length, users });
  });

  // Perform User Action (Suspend, Reactivate, Delete)
  app.post('/api/admin/users/action', verifyAdminAuth, (req: Request, res: Response) => {
    const { userId, action, adminEmail } = req.body;
    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action required.' });
    }

    const admin = adminEmail || 'admin@atscvoptimizer.com';

    if (action === 'SUSPEND') {
      const updated = adminDataStore.updateUserStatus(userId, 'SUSPENDED', admin);
      return res.json({ success: true, user: updated });
    } else if (action === 'REACTIVATE') {
      const updated = adminDataStore.updateUserStatus(userId, 'ACTIVE', admin);
      return res.json({ success: true, user: updated });
    } else if (action === 'DELETE') {
      const deleted = adminDataStore.deleteUser(userId, admin);
      return res.json({ success: true, deleted });
    }

    res.status(400).json({ error: 'Invalid user action.' });
  });

  // 3. CV & ATS Analytics
  app.get('/api/admin/analytics/cv-ats', verifyAdminAuth, (req: Request, res: Response) => {
    const northStar = adminDataStore.getNorthStarMetrics();
    const scores = adminDataStore.getScoreDistribution();
    res.json({
      success: true,
      metrics: {
        cvsUploaded: northStar.cvsUploaded,
        cvsParsed: northStar.cvsParsed,
        cvsAnalyzed: northStar.cvsAnalyzed,
        cvsOptimized: northStar.cvsOptimized,
        cvsDownloaded: northStar.cvsDownloaded,
        avgInitialScore: northStar.avgInitialScore,
        avgOptimizedScore: northStar.avgOptimizedScore,
        avgImprovement: northStar.avgScoreImprovement,
        optimizationCompletionRate: northStar.optimizationCompletionRate,
      },
      scoreDistribution: scores,
    });
  });

  // 4. Job & Skill Intelligence Analytics
  app.get('/api/admin/analytics/jobs-skills', verifyAdminAuth, (req: Request, res: Response) => {
    const jobSkills = adminDataStore.getJobSkillAnalytics();
    res.json({ success: true, jobSkills });
  });

  // 5. Template Usage Analytics
  app.get('/api/admin/analytics/templates', verifyAdminAuth, (req: Request, res: Response) => {
    const templates = adminDataStore.getTemplateStats();
    res.json({ success: true, templates });
  });

  // 6. AI Operations & Cost Analytics
  app.get('/api/admin/analytics/ai', verifyAdminAuth, (req: Request, res: Response) => {
    const aiUsage = adminDataStore.getAIUsage();
    res.json({ success: true, aiUsage });
  });

  // Update AI Daily Cost Alert Threshold
  app.post('/api/admin/ai/cost-alert', verifyAdminAuth, (req: Request, res: Response) => {
    const { threshold, adminEmail } = req.body;
    if (typeof threshold !== 'number' || threshold <= 0) {
      return res.status(400).json({ error: 'Valid positive threshold required.' });
    }

    const updated = adminDataStore.setAIAlertThreshold(threshold, adminEmail || 'admin@atscvoptimizer.com');
    res.json({ success: true, costAlertThresholdDaily: updated });
  });

  // 7. Revenue & Subscriptions Analytics
  app.get('/api/admin/analytics/revenue', verifyAdminAuth, (req: Request, res: Response) => {
    const revenue = adminDataStore.getRevenueMetrics();
    res.json({ success: true, revenue });
  });

  // 8. System Health Center
  app.get('/api/admin/system-health', verifyAdminAuth, (req: Request, res: Response) => {
    const health = adminDataStore.getSystemHealth();
    res.json({ success: true, health });
  });

  // 9. Security Monitoring
  app.get('/api/admin/security', verifyAdminAuth, (req: Request, res: Response) => {
    const events = adminDataStore.getSecurityEvents();
    res.json({ success: true, events });
  });

  // 10. Audit Logs
  app.get('/api/admin/audit-logs', verifyAdminAuth, (req: Request, res: Response) => {
    const logs = adminDataStore.getAuditLogs();
    res.json({ success: true, logs });
  });

  // 11. Admin Analytics Data Export (CSV / JSON)
  app.post('/api/admin/export', verifyAdminAuth, (req: Request, res: Response) => {
    const { format } = req.body;
    const northStar = adminDataStore.getNorthStarMetrics();
    const aiUsage = adminDataStore.getAIUsage();
    const users = adminDataStore.getAllUsers();

    if (format === 'csv') {
      let csv = 'Metric,Value\n';
      csv += `Total Users,${northStar.totalUsers}\n`;
      csv += `MAU,${northStar.mau}\n`;
      csv += `CVs Uploaded,${northStar.cvsUploaded}\n`;
      csv += `CVs Analyzed,${northStar.cvsAnalyzed}\n`;
      csv += `CVs Optimized,${northStar.cvsOptimized}\n`;
      csv += `CV Downloads,${northStar.cvsDownloaded}\n`;
      csv += `CV Optimization Completion Rate (Primary Metric),${northStar.optimizationCompletionRate}%\n`;
      csv += `Avg Score Improvement,+${northStar.avgScoreImprovement}\n`;
      csv += `AI Cost per Optimization,$${northStar.aiCostPerOptimization}\n`;
      csv += `Total AI Cost,$${aiUsage.estimatedCost}\n`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ats_optimizer_analytics.csv"');
      return res.send(csv);
    }

    res.json({
      exportedAt: new Date().toISOString(),
      northStar,
      aiUsage,
      usersCount: users.length,
    });
  });


  // 1. Parse CV (Raw text or File Base64)
  app.post('/api/parse-cv', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { text, fileData, fileType } = req.body;
      let extractedText = text || '';

      if (fileData && fileType) {
        const buffer = Buffer.from(fileData, 'base64');
        if (fileType.includes('pdf')) {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (fileType.includes('word') || fileType.includes('docx')) {
          const docxResult = await mammoth.extractRawText({ buffer });
          extractedText = docxResult.value;
        }
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'No readable text content found in CV file or input.' });
      }

      // Parse with Gemini
      const structuredCV = await parseCVFromText(extractedText);
      const latencyMs = Date.now() - startTime;

      // Real-time Activity & Telemetry Sync
      adminDataStore.recordEvent('AIRequest', {
        category: 'parsing',
        latencyMs,
        inputTokens: Math.max(200, Math.round(extractedText.length / 4)),
        outputTokens: 750,
        userEmail,
      });
      adminDataStore.recordEvent('CVUploaded', { userEmail });
      adminDataStore.recordEvent('CVParsed', { userEmail });

      res.json({ success: true, cv: structuredCV });
    } catch (error: any) {
      console.error('API /api/parse-cv error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'parsing', userEmail });
      res.status(500).json({ error: error.message || 'Failed to parse CV text.' });
    }
  });

  // 1b. Parse CV from Cloud Storage URL (Google Drive, Dropbox, OneDrive, Direct Links)
  app.post('/api/parse-cloud-url', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'A valid cloud file URL is required.' });
      }

      let fetchUrl = url.trim();
      let extractedText = '';

      // Normalize Google Drive shared links
      if (fetchUrl.includes('drive.google.com') || fetchUrl.includes('docs.google.com')) {
        const match = fetchUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || fetchUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          const docTxtUrl = `https://docs.google.com/document/d/${fileId}/export?format=txt`;
          try {
            const txtRes = await fetch(docTxtUrl);
            if (txtRes.ok) {
              extractedText = await txtRes.text();
            }
          } catch (_) {}

          if (!extractedText) {
            fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          }
        }
      } else if (fetchUrl.includes('dropbox.com')) {
        fetchUrl = fetchUrl.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      }

      if (!extractedText) {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file from cloud storage URL (${response.status} ${response.statusText})`);
        }

        const contentType = response.headers.get('content-type') || '';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (contentType.includes('pdf') || fetchUrl.toLowerCase().endsWith('.pdf')) {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (
          contentType.includes('word') ||
          contentType.includes('docx') ||
          fetchUrl.toLowerCase().endsWith('.docx') ||
          fetchUrl.toLowerCase().endsWith('.doc')
        ) {
          const docxResult = await mammoth.extractRawText({ buffer });
          extractedText = docxResult.value;
        } else {
          extractedText = buffer.toString('utf-8');
        }
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'No readable text content found in cloud file.' });
      }

      const structuredCV = await parseCVFromText(extractedText);
      const latencyMs = Date.now() - startTime;

      adminDataStore.recordEvent('AIRequest', {
        category: 'parsing',
        latencyMs,
        inputTokens: Math.max(200, Math.round(extractedText.length / 4)),
        outputTokens: 750,
        userEmail,
      });
      adminDataStore.recordEvent('CVUploaded', { userEmail });
      adminDataStore.recordEvent('CVParsed', { userEmail });

      res.json({ success: true, cv: structuredCV });
    } catch (error: any) {
      console.error('API /api/parse-cloud-url error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'parsing', userEmail });
      res.status(500).json({ error: error.message || 'Failed to fetch and parse document from cloud URL.' });
    }
  });

  // 2. Parse Job Description
  app.post('/api/parse-job', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { text, fileData, fileType } = req.body;
      let extractedText = text || '';

      if (fileData && fileType) {
        const buffer = Buffer.from(fileData, 'base64');
        if (fileType.includes('pdf')) {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (fileType.includes('word') || fileType.includes('docx')) {
          const docxResult = await mammoth.extractRawText({ buffer });
          extractedText = docxResult.value;
        }
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'No readable text found in Job Description.' });
      }

      const structuredJob = await extractJobRequirementsFromText(extractedText);
      const latencyMs = Date.now() - startTime;

      adminDataStore.recordEvent('AIRequest', {
        category: 'job',
        latencyMs,
        inputTokens: Math.max(150, Math.round(extractedText.length / 4)),
        outputTokens: 500,
        userEmail,
      });
      adminDataStore.recordEvent('JobDescriptionSubmitted', {
        title: structuredJob.jobTitle,
        industry: structuredJob.industryKeywords?.[0] || 'Technology',
        requiredSkills: structuredJob.requiredSkills,
        userEmail,
      });

      res.json({ success: true, job: structuredJob });
    } catch (error: any) {
      console.error('API /api/parse-job error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'job', userEmail });
      res.status(500).json({ error: error.message || 'Failed to parse job description.' });
    }
  });

  // 3. ATS Analysis
  app.post('/api/analyze-ats', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { cv, job } = req.body;
      if (!cv || !job) {
        return res.status(400).json({ error: 'Both CV and Job requirements are required.' });
      }

      const analysisResult = await analyzeATS(cv, job);
      const latencyMs = Date.now() - startTime;

      adminDataStore.recordEvent('AIRequest', {
        category: 'ats',
        latencyMs,
        inputTokens: 2200,
        outputTokens: 900,
        userEmail,
      });
      adminDataStore.recordEvent('AnalysisCompleted', {
        score: analysisResult.overallScore,
        matchedSkills: analysisResult.skillsAnalysis?.matched,
        missingSkills: analysisResult.skillsAnalysis?.missing,
        partialSkills: analysisResult.skillsAnalysis?.partial,
        userEmail,
      });

      res.json({ success: true, analysis: analysisResult });
    } catch (error: any) {
      console.error('API /api/analyze-ats error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'ats', userEmail });
      res.status(500).json({ error: error.message || 'Failed to run ATS analysis.' });
    }
  });

  // 4. Optimize CV
  app.post('/api/optimize-cv', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { cv, job, level } = req.body;
      if (!cv || !job) {
        return res.status(400).json({ error: 'Both CV and Job requirements are required.' });
      }

      const optimizationResult = await optimizeCV(cv, job, (level as OptimizationLevel) || 'Balanced');
      const latencyMs = Date.now() - startTime;

      adminDataStore.recordEvent('AIRequest', {
        category: 'optimization',
        latencyMs,
        inputTokens: 3800,
        outputTokens: 1800,
        userEmail,
      });
      adminDataStore.recordEvent('OptimizationCompleted', {
        score: optimizationResult.summary?.newScore,
        initialScore: optimizationResult.summary?.originalScore,
        userEmail,
      });

      res.json({ success: true, result: optimizationResult });
    } catch (error: any) {
      console.error('API /api/optimize-cv error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'optimization', userEmail });
      res.status(500).json({ error: error.message || 'Failed to optimize CV.' });
    }
  });

  // 5. Regenerate Single Section
  app.post('/api/regenerate-section', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { cv, sectionKey, job } = req.body;
      if (!cv || !sectionKey || !job) {
        return res.status(400).json({ error: 'CV, sectionKey, and Job description required.' });
      }

      const updatedCV = await regenerateCVSection(cv, sectionKey, job);
      const latencyMs = Date.now() - startTime;

      adminDataStore.recordEvent('AIRequest', {
        category: 'regeneration',
        latencyMs,
        inputTokens: 1200,
        outputTokens: 600,
        userEmail,
      });

      res.json({ success: true, cv: updatedCV });
    } catch (error: any) {
      console.error('API /api/regenerate-section error:', error);
      adminDataStore.recordEvent('AIRequestFailed', { category: 'regeneration', userEmail });
      res.status(500).json({ error: error.message || 'Failed to regenerate section.' });
    }
  });

  // 6. Export DOCX
  app.post('/api/export-docx', async (req: Request, res: Response) => {
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { cv, templateId } = req.body;
      if (!cv) {
        return res.status(400).json({ error: 'Structured CV is required for export.' });
      }

      const normalized = normalizeCV(cv);
      const docxBlob = await generateDocxBlob(normalized, (templateId as CVTemplateId) || 'classic');
      const arrayBuffer = await docxBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      adminDataStore.recordEvent('CVDownloaded', { templateId: templateId || 'classic', format: 'docx', userEmail });
      adminDataStore.recordEvent('DocumentGenerated', { templateId: templateId || 'classic', format: 'docx', userEmail });

      const safeName = (normalized.personalInfo.fullName || 'Candidate').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const fileName = `${safeName}_Optimized_CV.docx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error('API /api/export-docx error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate DOCX document.' });
    }
  });

  // 7. Export PDF
  app.post('/api/export-pdf', async (req: Request, res: Response) => {
    const userEmail = req.body.userEmail || req.body.email || 'anonymous';
    try {
      const { cv, templateId } = req.body;
      if (!cv) {
        return res.status(400).json({ error: 'Structured CV is required for export.' });
      }

      const normalized = normalizeCV(cv);
      const pdfBlob = generatePDFBlob(normalized, (templateId as CVTemplateId) || 'classic');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      adminDataStore.recordEvent('CVDownloaded', { templateId: templateId || 'classic', format: 'pdf', userEmail });
      adminDataStore.recordEvent('DocumentGenerated', { templateId: templateId || 'classic', format: 'pdf', userEmail });

      const safeName = (normalized.personalInfo.fullName || 'Candidate').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const fileName = `${safeName}_Optimized_CV.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error('API /api/export-pdf error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate PDF document.' });
    }
  });

  // --- VITE / STATIC FILE HANDLING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ATS CV Optimizer Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
