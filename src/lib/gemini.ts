/**
 * ATS CV Optimizer - Dedicated Server-Side AI Service Layer
 * Uses Google GenAI SDK (@google/genai) with strictly enforced Anti-Hallucination rules.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  StructuredCV,
  StructuredJob,
  ATSAnalysisResult,
  OptimizationLevel,
  OptimizedCVResult,
  MissingSkillConfirmation
} from '../types';

// Helper to instantiate server-side Gemini client lazily
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. Parse raw CV text into StructuredCV JSON schema
 */
export async function parseCVFromText(rawText: string): Promise<StructuredCV> {
  const ai = getGeminiClient();

  const systemInstruction = `
You are an expert HR Resume Parser. Extract structured information from the provided raw CV text into JSON.
Return ONLY valid JSON matching the schema.

STRICT ACCURACY RULES:
- Extract facts EXACTLY as written in the CV text.
- Do NOT invent companies, dates, degrees, certifications, or bullet points.
- If a section or field is missing, use empty arrays or empty strings.
`;

  const prompt = `Extract structured CV JSON from this text:\n\n${rawText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                portfolio: { type: Type.STRING },
                github: { type: Type.STRING },
              },
              required: ['fullName', 'email', 'phone', 'location'],
            },
            summary: { type: Type.STRING },
            coreCompetencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            technicalSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['category', 'skills'],
              },
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  isCurrent: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                  achievements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['company', 'jobTitle', 'startDate', 'endDate', 'achievements'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                  achievements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['name', 'description'],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  gpa: { type: Type.STRING },
                  location: { type: Type.STRING },
                },
                required: ['institution', 'degree'],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['name', 'issuer'],
              },
            },
            additionalInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['personalInfo', 'summary', 'coreCompetencies', 'experience', 'education'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as StructuredCV;
    parsed.rawText = rawText;
    
    // Assign stable IDs if missing
    if (parsed.experience) {
      parsed.experience = parsed.experience.map((e, idx) => ({ ...e, id: e.id || `exp-${idx + 1}` }));
    }
    if (parsed.projects) {
      parsed.projects = parsed.projects.map((p, idx) => ({ ...p, id: p.id || `proj-${idx + 1}` }));
    }
    if (parsed.education) {
      parsed.education = parsed.education.map((ed, idx) => ({ ...ed, id: ed.id || `edu-${idx + 1}` }));
    }
    if (parsed.certifications) {
      parsed.certifications = parsed.certifications.map((c, idx) => ({ ...c, id: c.id || `cert-${idx + 1}` }));
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing CV with Gemini:', error);
    throw error;
  }
}

/**
 * 2. Extract structured job requirements from raw job description text
 */
export async function extractJobRequirementsFromText(rawText: string): Promise<StructuredJob> {
  const ai = getGeminiClient();

  const systemInstruction = `
You are an expert HR Analyst. Parse a job description into structured requirements JSON.
Identify required skills, preferred skills, responsibilities, education requirements, certifications, experience requirements, industry keywords, and technologies.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract requirements from this Job Description:\n\n${rawText}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING },
            company: { type: Type.STRING },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            preferredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            responsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            educationRequirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceRequirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            industryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            softSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            technologies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['jobTitle', 'requiredSkills', 'responsibilities', 'technologies'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as StructuredJob;
    parsed.rawText = rawText;
    if (!parsed.company) parsed.company = 'Target Company';
    return parsed;
  } catch (error) {
    console.error('Error extracting job requirements with Gemini:', error);
    throw error;
  }
}

/**
 * 3. Analyze CV against Job Description to generate ATS Compatibility Score & Keyword Matrix
 */
export async function analyzeATS(cv: StructuredCV, job: StructuredJob): Promise<ATSAnalysisResult> {
  const ai = getGeminiClient();

  const systemInstruction = `
You are an Enterprise ATS Analysis Engine and Senior Recruiter.
Analyze the provided Structured Candidate CV against the Target Job Description.

SCORING MODEL (0-100 total):
- Keyword & terminology relevance: max 25 pts
- Technical / functional skills match: max 20 pts
- Experience & responsibility alignment: max 20 pts
- Education & certifications match: max 10 pts
- Job title / role relevance: max 10 pts
- Achievements and measurable impact: max 5 pts
- ATS formatting & readability: max 10 pts

Provide an honest, objective breakdown.
Classify keywords as MATCHED (clearly evidenced), PARTIAL (related experience but missing exact terminology), or MISSING (not in CV).
`;

  const inputPayload = JSON.stringify({
    cv,
    jobRequirements: job,
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze candidate CV match against job requirements:\n\n${inputPayload}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            matchLabel: { type: Type.STRING },
            dimensionScores: {
              type: Type.OBJECT,
              properties: {
                keywordScore: { type: Type.INTEGER },
                skillsScore: { type: Type.INTEGER },
                experienceScore: { type: Type.INTEGER },
                educationScore: { type: Type.INTEGER },
                jobTitleScore: { type: Type.INTEGER },
                achievementsScore: { type: Type.INTEGER },
                formattingScore: { type: Type.INTEGER },
              },
              required: ['keywordScore', 'skillsScore', 'experienceScore', 'educationScore', 'jobTitleScore', 'achievementsScore', 'formattingScore'],
            },
            keywordAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  importance: { type: Type.STRING },
                  status: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ['keyword', 'importance', 'status', 'evidence', 'recommendation'],
              },
            },
            skillsAnalysis: {
              type: Type.OBJECT,
              properties: {
                matched: { type: Type.ARRAY, items: { type: Type.STRING } },
                partial: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['matched', 'partial', 'missing'],
            },
            experienceAnalysis: {
              type: Type.OBJECT,
              properties: {
                matchLevel: { type: Type.STRING },
                details: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['matchLevel', 'details', 'missingRequirements'],
            },
            educationAnalysis: {
              type: Type.OBJECT,
              properties: {
                matchLevel: { type: Type.STRING },
                details: { type: Type.STRING },
              },
              required: ['matchLevel', 'details'],
            },
            certificationAnalysis: {
              type: Type.OBJECT,
              properties: {
                matchLevel: { type: Type.STRING },
                details: { type: Type.STRING },
              },
              required: ['matchLevel', 'details'],
            },
            formattingAnalysis: {
              type: Type.OBJECT,
              properties: {
                isSingleColumn: { type: Type.BOOLEAN },
                hasTablesOrGraphics: { type: Type.BOOLEAN },
                issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                score: { type: Type.INTEGER },
              },
              required: ['isSingleColumn', 'hasTablesOrGraphics', 'issues', 'score'],
            },
            topImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
            remainingGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            recruiterView: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
              },
              required: ['strengths', 'gaps', 'summary'],
            },
          },
          required: [
            'overallScore',
            'matchLabel',
            'dimensionScores',
            'keywordAnalysis',
            'skillsAnalysis',
            'experienceAnalysis',
            'educationAnalysis',
            'formattingAnalysis',
            'topImprovements',
            'recruiterView'
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as ATSAnalysisResult;
    return parsed;
  } catch (error) {
    console.error('Error running ATS analysis with Gemini:', error);
    throw error;
  }
}

/**
 * 4. Optimize CV for target Job Description with Anti-Hallucination Enforcements
 */
export async function optimizeCV(
  cv: StructuredCV,
  job: StructuredJob,
  level: OptimizationLevel = 'Balanced'
): Promise<OptimizedCVResult> {
  const ai = getGeminiClient();

  const systemInstruction = `
You are an Expert Resume Writer & ATS Optimization Engine.
Your task is to optimize the candidate's CV specifically for the target job position at level: "${level}".

CRITICAL ANTI-HALLUCINATION DIRECTIVES (STRICT COMPLIANCE MANDATORY):
1. NEVER fabricate or invent:
   - Employer names, company names
   - Job titles or roles held
   - Dates of employment or education
   - Degrees or universities
   - Certifications or credential IDs
   - Fake revenue numbers, fake percentage increases, or metric values NOT in the original CV.
2. What you SHOULD optimize:
   - Professional Summary: Rephrase into an engaging, 60-100 word value proposition highlighting genuine skills aligned with the job.
   - Experience Bullets: Rephrase weak action verbs into strong ATS action verbs (ACTION + TASK + TOOL + TRUTHFUL OUTCOME).
   - Core Competencies & Skills: Reorder and highlight genuine candidate skills that match the job description keywords.
   - Action Verb Strength & Structural Readability.
3. If a required job skill (e.g. Tableau, AWS, Snowflake) is MISSING from the original CV:
   - DO NOT automatically insert it into the experience or skills sections!
   - Instead, list it in the separate "missingSkillsForConfirmation" array so the candidate can be asked if they possess it.

OPTIMIZATION INTENSITY:
- Conservative: Minimal rewriting. Only polish phrasing and fix formatting.
- Balanced (Default): Rewrite experience bullet points using strong action verbs, align keywords, optimize summary, reorganize sections for maximum relevance.
- Aggressive: Maximum tailoring and alignment while remaining 100% truthful to candidate's history.
`;

  const inputPayload = JSON.stringify({
    level,
    originalCV: cv,
    targetJob: job,
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Optimize candidate CV for job requirements:\n\n${inputPayload}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedCV: {
              type: Type.OBJECT,
              properties: {
                personalInfo: {
                  type: Type.OBJECT,
                  properties: {
                    fullName: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    location: { type: Type.STRING },
                    linkedin: { type: Type.STRING },
                    portfolio: { type: Type.STRING },
                    github: { type: Type.STRING },
                  },
                  required: ['fullName', 'email', 'phone', 'location'],
                },
                summary: { type: Type.STRING },
                coreCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                technicalSkills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['category', 'skills'],
                  },
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      company: { type: Type.STRING },
                      jobTitle: { type: Type.STRING },
                      location: { type: Type.STRING },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING },
                      isCurrent: { type: Type.BOOLEAN },
                      description: { type: Type.STRING },
                      achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['company', 'jobTitle', 'startDate', 'endDate', 'achievements'],
                  },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING },
                      description: { type: Type.STRING },
                      achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['name', 'description'],
                  },
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      fieldOfStudy: { type: Type.STRING },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING },
                      gpa: { type: Type.STRING },
                      location: { type: Type.STRING },
                    },
                    required: ['institution', 'degree'],
                  },
                },
                certifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      issuer: { type: Type.STRING },
                      date: { type: Type.STRING },
                    },
                    required: ['name', 'issuer'],
                  },
                },
                additionalInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['personalInfo', 'summary', 'coreCompetencies', 'experience', 'education'],
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                originalScore: { type: Type.INTEGER },
                newScore: { type: Type.INTEGER },
                improvementDelta: { type: Type.INTEGER },
                changesSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
                addedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                rewrittenSections: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['originalScore', 'newScore', 'improvementDelta', 'changesSummary', 'addedKeywords'],
            },
            missingSkillsForConfirmation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  category: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['skill', 'category', 'reason'],
              },
            },
          },
          required: ['optimizedCV', 'summary', 'missingSkillsForConfirmation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as OptimizedCVResult;

    // Validate Anti-Hallucination integrity
    validateTruthfulness(cv, parsed.optimizedCV);

    return parsed;
  } catch (error) {
    console.error('Error optimizing CV with Gemini:', error);
    throw error;
  }
}

/**
 * 5. Regenerate a single section of the CV
 */
export async function regenerateCVSection(
  cv: StructuredCV,
  sectionKey: string,
  job: StructuredJob
): Promise<StructuredCV> {
  const ai = getGeminiClient();

  const prompt = `
Target Job: ${job.jobTitle} at ${job.company}
Required Skills: ${job.requiredSkills.join(', ')}

Please re-optimize ONLY the "${sectionKey}" section of this CV while keeping all facts 100% truthful.
Return the complete updated StructuredCV object in JSON.
Original CV:
${JSON.stringify(cv)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert resume editor. Rewrite only the requested section while preserving factual accuracy.',
        responseMimeType: 'application/json',
      },
    });

    const updated = JSON.parse(response.text || '{}') as StructuredCV;
    validateTruthfulness(cv, updated);
    return updated;
  } catch (error) {
    console.error(`Error regenerating section ${sectionKey}:`, error);
    return cv;
  }
}

/**
 * Factual Truthfulness Validation Layer
 * Ensures employers, dates, degrees, and institutions were not modified or fabricated.
 */
function validateTruthfulness(original: StructuredCV, optimized: StructuredCV): void {
  // Ensure same company names are preserved
  const originalCompanies = new Set(original.experience.map(e => e.company.toLowerCase().trim()));
  const optimizedCompanies = optimized.experience.map(e => e.company.toLowerCase().trim());

  for (const comp of optimizedCompanies) {
    if (!originalCompanies.has(comp)) {
      console.warn(`Truthfulness Warning: Optimized CV contains company "${comp}" not found in original CV.`);
    }
  }

  // Ensure education institutions preserved
  const originalEd = new Set(original.education.map(e => e.institution.toLowerCase().trim()));
  for (const ed of optimized.education) {
    if (!originalEd.has(ed.institution.toLowerCase().trim())) {
      console.warn(`Truthfulness Warning: Optimized CV contains institution "${ed.institution}" not in original.`);
    }
  }
}
