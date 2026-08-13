import { StructuredCV, SkillCategory } from '../types';

/**
 * Sanitizes a string input:
 * - Converts non-strings or null/undefined to clean string
 * - Strips markdown syntax like **bold**, *italic*, `code`, etc.
 * - Trims whitespace and removes leading bullet symbols
 */
export function sanitizeString(input: any): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    if (typeof input === 'object') return '';
    input = String(input);
  }
  return input
    .replace(/\*\*(.*?)\*\*/g, '$1') // **bold**
    .replace(/\*(.*?)\*/g, '$1')     // *italic*
    .replace(/_(.*?)_/g, '$1')       // _italic_
    .replace(/`(.*?)`/g, '$1')       // `code`
    .replace(/^[\s•\-\*]+/, '')      // leading bullet symbols
    .trim();
}

/**
 * Normalizes any StructuredCV object into a clean, safe, fully-typed object.
 * Prevents [object Object], undefined strings, or malformed nested data.
 */
export function normalizeCV(cv: StructuredCV): StructuredCV {
  if (!cv || typeof cv !== 'object') {
    return {
      personalInfo: { fullName: 'Candidate Name', email: '', phone: '', location: '' },
      summary: '',
      coreCompetencies: [],
      technicalSkills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      additionalInformation: [],
    };
  }

  // Personal Info
  const p = cv.personalInfo || ({} as any);
  const personalInfo = {
    fullName: sanitizeString(p.fullName) || 'Candidate Name',
    email: sanitizeString(p.email),
    phone: sanitizeString(p.phone),
    location: sanitizeString(p.location),
    linkedin: sanitizeString(p.linkedin),
    portfolio: sanitizeString(p.portfolio),
    github: sanitizeString(p.github),
  };

  // Summary
  const summary = sanitizeString(cv.summary);

  // Core Competencies
  const rawComp = Array.isArray(cv.coreCompetencies) ? cv.coreCompetencies : [];
  const coreCompetencies = rawComp
    .map((c) => (typeof c === 'string' ? sanitizeString(c) : sanitizeString((c as any)?.name || (c as any)?.skill)))
    .filter(Boolean);

  // Technical Skills
  let technicalSkills: SkillCategory[] | string[] = [];
  if (Array.isArray(cv.technicalSkills)) {
    if (cv.technicalSkills.length > 0 && typeof cv.technicalSkills[0] === 'string') {
      technicalSkills = (cv.technicalSkills as string[]).map(sanitizeString).filter(Boolean);
    } else {
      technicalSkills = (cv.technicalSkills as any[])
        .map((catObj) => {
          if (!catObj || typeof catObj !== 'object') return null;
          const category = sanitizeString(catObj.category) || 'Technical Skills';
          const rawSkills = Array.isArray(catObj.skills) ? catObj.skills : [catObj.skills];
          const skills = rawSkills.map(sanitizeString).filter(Boolean);
          if (skills.length === 0) return null;
          return { category, skills };
        })
        .filter(Boolean) as SkillCategory[];
    }
  }

  // Experience
  const rawExp = Array.isArray(cv.experience) ? cv.experience : [];
  const experience = rawExp.map((exp, idx) => {
    const rawAch = Array.isArray(exp.achievements) ? exp.achievements : [];
    const achievements = rawAch
      .map((a) => (typeof a === 'string' ? sanitizeString(a) : sanitizeString((a as any)?.text || (a as any)?.description)))
      .filter(Boolean);

    return {
      id: exp.id || `exp-${idx + 1}`,
      company: sanitizeString(exp.company) || 'Company',
      jobTitle: sanitizeString(exp.jobTitle) || 'Role',
      location: sanitizeString(exp.location),
      startDate: sanitizeString(exp.startDate),
      endDate: sanitizeString(exp.endDate),
      isCurrent: Boolean(exp.isCurrent),
      description: sanitizeString(exp.description),
      achievements,
      technologies: Array.isArray(exp.technologies) ? exp.technologies.map(sanitizeString).filter(Boolean) : [],
    };
  });

  // Projects
  const rawProj = Array.isArray(cv.projects) ? cv.projects : [];
  const projects = rawProj.map((proj, idx) => {
    const rawAch = Array.isArray(proj.achievements) ? proj.achievements : [];
    const achievements = rawAch.map(sanitizeString).filter(Boolean);

    return {
      id: proj.id || `proj-${idx + 1}`,
      name: sanitizeString(proj.name) || 'Project',
      role: sanitizeString(proj.role),
      startDate: sanitizeString(proj.startDate),
      endDate: sanitizeString(proj.endDate),
      description: sanitizeString(proj.description),
      achievements,
      technologies: Array.isArray(proj.technologies) ? proj.technologies.map(sanitizeString).filter(Boolean) : [],
    };
  });

  // Education
  const rawEdu = Array.isArray(cv.education) ? cv.education : [];
  const education = rawEdu.map((edu, idx) => ({
    id: edu.id || `edu-${idx + 1}`,
    institution: sanitizeString(edu.institution) || 'University',
    degree: sanitizeString(edu.degree) || 'Degree',
    fieldOfStudy: sanitizeString(edu.fieldOfStudy),
    startDate: sanitizeString(edu.startDate),
    endDate: sanitizeString(edu.endDate),
    gpa: sanitizeString(edu.gpa),
    location: sanitizeString(edu.location),
  }));

  // Certifications
  const rawCert = Array.isArray(cv.certifications) ? cv.certifications : [];
  const certifications = rawCert.map((cert, idx) => ({
    id: cert.id || `cert-${idx + 1}`,
    name: sanitizeString(cert.name) || 'Certification',
    issuer: sanitizeString(cert.issuer) || 'Issuer',
    date: sanitizeString(cert.date),
  }));

  // Additional Information
  const rawAdd = Array.isArray(cv.additionalInformation) ? cv.additionalInformation : [];
  const additionalInformation = rawAdd.map(sanitizeString).filter(Boolean);

  return {
    personalInfo,
    summary,
    coreCompetencies,
    technicalSkills,
    experience,
    projects,
    education,
    certifications,
    additionalInformation,
  };
}
