/**
 * ATS CV Optimizer - Professional PDF Document Generator
 * Uses jsPDF to construct crisp, text-searchable, multi-page PDF documents.
 */

import { jsPDF } from 'jspdf';
import { StructuredCV, CVTemplateId } from '../types';
import { normalizeCV, sanitizeString } from './cvNormalizer';

interface PDFTheme {
  font: string;
  primaryRGB: [number, number, number];
  secondaryRGB: [number, number, number];
  textRGB: [number, number, number];
}

const THEMES: Record<CVTemplateId, PDFTheme> = {
  classic: {
    font: 'times',
    primaryRGB: [17, 24, 39],     // dark gray
    secondaryRGB: [55, 65, 81],
    textRGB: [31, 41, 55],
  },
  modern: {
    font: 'helvetica',
    primaryRGB: [30, 58, 138],    // blue 900
    secondaryRGB: [31, 41, 55],
    textRGB: [51, 65, 85],
  },
  corporate: {
    font: 'helvetica',
    primaryRGB: [15, 23, 42],     // slate 900
    secondaryRGB: [51, 65, 85],
    textRGB: [30, 41, 59],
  },
  technical: {
    font: 'helvetica',
    primaryRGB: [4, 120, 87],     // emerald 700
    secondaryRGB: [31, 41, 55],
    textRGB: [30, 41, 59],
  },
  executive: {
    font: 'times',
    primaryRGB: [76, 29, 149],    // purple 900
    secondaryRGB: [49, 46, 129],
    textRGB: [31, 41, 55],
  },
};

export function generatePDFBlob(rawCv: StructuredCV, templateId: CVTemplateId = 'classic'): Blob {
  const cv = normalizeCV(rawCv);
  const theme = THEMES[templateId] || THEMES.classic;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 532 pt
  const maxY = pageHeight - margin; // 752 pt

  let y = 45;

  // Helper: Ensures y fits on page before printing block
  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = 45;
    }
  };

  // Helper: Writes multi-line wrapped text with line-by-line page break check
  const writeWrappedText = (
    text: string,
    opts: {
      fontSize?: number;
      fontStyle?: string;
      color?: [number, number, number];
      indent?: number;
      lineSpacing?: number;
    } = {}
  ) => {
    const clean = sanitizeString(text);
    if (!clean) return;

    const fontSize = opts.fontSize || 9.5;
    const fontStyle = opts.fontStyle || 'normal';
    const color = opts.color || theme.textRGB;
    const indent = opts.indent || 0;
    const lineHeight = opts.lineSpacing || fontSize * 1.3;
    const width = contentWidth - indent;

    doc.setFont(theme.font, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(clean, width);
    for (const line of lines) {
      if (y + lineHeight > maxY) {
        doc.addPage();
        y = 45;
      }
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
  };

  // 1. Header Name
  doc.setFont(theme.font, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...theme.primaryRGB);

  const nameText = cv.personalInfo.fullName.toUpperCase();
  if (templateId === 'classic' || templateId === 'executive') {
    doc.text(nameText, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.text(nameText, margin, y);
  }
  y += 20;

  // Contact Info Line
  const contactParts = [
    cv.personalInfo.location,
    cv.personalInfo.phone,
    cv.personalInfo.email,
    cv.personalInfo.linkedin,
    cv.personalInfo.github,
    cv.personalInfo.portfolio,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    const contactStr = contactParts.join('  |  ');
    doc.setFont(theme.font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...theme.secondaryRGB);

    if (doc.getTextWidth(contactStr) <= contentWidth) {
      const xPos = templateId === 'classic' || templateId === 'executive' ? pageWidth / 2 : margin;
      const alignOpt = templateId === 'classic' || templateId === 'executive' ? ({ align: 'center' } as const) : undefined;
      doc.text(contactStr, xPos, y, alignOpt);
      y += 18;
    } else {
      const splitContact = doc.splitTextToSize(contactStr, contentWidth);
      for (const line of splitContact) {
        const xPos = templateId === 'classic' || templateId === 'executive' ? pageWidth / 2 : margin;
        const alignOpt = templateId === 'classic' || templateId === 'executive' ? ({ align: 'center' } as const) : undefined;
        doc.text(line, xPos, y, alignOpt);
        y += 12;
      }
      y += 6;
    }
  }

  // Draw dividing line under header
  doc.setDrawColor(...theme.primaryRGB);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // Helper for Section Heading
  const addSectionHeader = (title: string) => {
    ensureSpace(32);
    doc.setFont(theme.font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...theme.primaryRGB);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(...theme.primaryRGB);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  // 2. Summary
  if (cv.summary) {
    addSectionHeader('Professional Summary');
    writeWrappedText(cv.summary, { fontSize: 9.5, color: theme.textRGB });
    y += 8;
  }

  // 3. Core Competencies
  if (cv.coreCompetencies && cv.coreCompetencies.length > 0) {
    addSectionHeader('Core Competencies');
    const compText = cv.coreCompetencies.join('  •  ');
    writeWrappedText(compText, { fontSize: 9.5, fontStyle: 'bold', color: theme.secondaryRGB });
    y += 8;
  }

  // Technical Skills Category
  if (Array.isArray(cv.technicalSkills) && cv.technicalSkills.length > 0) {
    addSectionHeader('Technical Skills');

    if (typeof cv.technicalSkills[0] === 'string') {
      const skillsStr = (cv.technicalSkills as string[]).join(', ');
      writeWrappedText(skillsStr, { fontSize: 9.5, color: theme.textRGB });
      y += 8;
    } else {
      for (const catObj of cv.technicalSkills as any[]) {
        if (!catObj || !catObj.category) continue;
        const category = sanitizeString(catObj.category);
        const skillsArr = Array.isArray(catObj.skills)
          ? catObj.skills.map(sanitizeString).filter(Boolean)
          : [sanitizeString(catObj.skills)];
        const skillsStr = skillsArr.join(', ');

        if (!skillsStr) continue;

        const lineStr = `${category}: ${skillsStr}`;
        writeWrappedText(lineStr, { fontSize: 9.5, color: theme.textRGB });
      }
      y += 6;
    }
  }

  // 4. Professional Experience
  if (cv.experience && cv.experience.length > 0) {
    addSectionHeader('Professional Experience');

    for (const exp of cv.experience) {
      ensureSpace(36);

      const jobTitle = sanitizeString(exp.jobTitle);
      const company = sanitizeString(exp.company);
      const location = sanitizeString(exp.location);
      const startDate = sanitizeString(exp.startDate);
      const endDate = exp.isCurrent ? 'Present' : sanitizeString(exp.endDate);
      const dateText = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);

      // Line 1: Job Title (left) & Date (right aligned)
      doc.setFont(theme.font, 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...theme.primaryRGB);

      const titleLines = doc.splitTextToSize(jobTitle, contentWidth - 110);
      doc.text(titleLines[0] || '', margin, y);

      if (dateText) {
        doc.setFont(theme.font, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...theme.secondaryRGB);
        doc.text(dateText, pageWidth - margin, y, { align: 'right' });
      }
      y += 14;

      if (titleLines.length > 1) {
        for (let i = 1; i < titleLines.length; i++) {
          ensureSpace(14);
          doc.setFont(theme.font, 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(...theme.primaryRGB);
          doc.text(titleLines[i], margin, y);
          y += 14;
        }
      }

      // Line 2: Company Name, Location
      const companyLoc = company + (location ? `, ${location}` : '');
      if (companyLoc) {
        ensureSpace(13);
        doc.setFont(theme.font, 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(...theme.secondaryRGB);
        doc.text(companyLoc, margin, y);
        y += 13;
      }

      // Description
      if (exp.description) {
        writeWrappedText(exp.description, { fontStyle: 'italic', fontSize: 9, color: theme.textRGB });
        y += 2;
      }

      // Achievements
      if (exp.achievements && Array.isArray(exp.achievements)) {
        for (const rawBullet of exp.achievements) {
          const bullet = sanitizeString(rawBullet);
          if (!bullet) continue;

          doc.setFont(theme.font, 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...theme.textRGB);

          const bulletLines = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 10);
          for (let li = 0; li < bulletLines.length; li++) {
            if (y + 12 > maxY) {
              doc.addPage();
              y = 45;
            }
            const xPos = li === 0 ? margin + 6 : margin + 16;
            doc.text(bulletLines[li], xPos, y);
            y += 12;
          }
        }
      }
      y += 6;
    }
  }

  // 5. Projects
  if (cv.projects && cv.projects.length > 0) {
    addSectionHeader('Key Projects');

    for (const proj of cv.projects) {
      ensureSpace(24);

      const name = sanitizeString(proj.name);
      const role = sanitizeString(proj.role);
      const description = sanitizeString(proj.description);

      const projHeader = name + (role ? ` (${role})` : '');
      writeWrappedText(projHeader, { fontSize: 10, fontStyle: 'bold', color: theme.primaryRGB });

      if (description) {
        writeWrappedText(description, { fontSize: 9.5, color: theme.textRGB });
      }

      if (proj.achievements && Array.isArray(proj.achievements)) {
        for (const rawB of proj.achievements) {
          const b = sanitizeString(rawB);
          if (!b) continue;

          doc.setFont(theme.font, 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...theme.textRGB);

          const bLines = doc.splitTextToSize(`•  ${b}`, contentWidth - 10);
          for (let li = 0; li < bLines.length; li++) {
            if (y + 12 > maxY) {
              doc.addPage();
              y = 45;
            }
            const xPos = li === 0 ? margin + 6 : margin + 16;
            doc.text(bLines[li], xPos, y);
            y += 12;
          }
        }
      }
      y += 6;
    }
  }

  // 6. Education
  if (cv.education && cv.education.length > 0) {
    addSectionHeader('Education');

    for (const edu of cv.education) {
      ensureSpace(28);

      const degree = sanitizeString(edu.degree);
      const field = sanitizeString(edu.fieldOfStudy);
      const institution = sanitizeString(edu.institution);
      const location = sanitizeString(edu.location);
      const startDate = sanitizeString(edu.startDate);
      const endDate = sanitizeString(edu.endDate);
      const dateText = startDate && endDate ? `${startDate} – ${endDate}` : (endDate || startDate);

      const degreeTitle = degree + (field ? ` in ${field}` : '');

      doc.setFont(theme.font, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...theme.primaryRGB);

      const degLines = doc.splitTextToSize(degreeTitle, contentWidth - 110);
      doc.text(degLines[0] || '', margin, y);

      if (dateText) {
        doc.setFont(theme.font, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...theme.secondaryRGB);
        doc.text(dateText, pageWidth - margin, y, { align: 'right' });
      }
      y += 13;

      if (degLines.length > 1) {
        for (let i = 1; i < degLines.length; i++) {
          ensureSpace(13);
          doc.setFont(theme.font, 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...theme.primaryRGB);
          doc.text(degLines[i], margin, y);
          y += 13;
        }
      }

      const instLoc = institution + (location ? `, ${location}` : '');
      if (instLoc) {
        ensureSpace(12);
        doc.setFont(theme.font, 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(...theme.secondaryRGB);
        doc.text(instLoc, margin, y);
        y += 12;
      }
      y += 4;
    }
  }

  // 7. Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    addSectionHeader('Certifications & Credentials');

    for (const cert of cv.certifications) {
      ensureSpace(14);
      const name = sanitizeString(cert.name);
      const issuer = sanitizeString(cert.issuer);
      const date = sanitizeString(cert.date);

      const certText = `•  ${name}${issuer ? ` — ${issuer}` : ''}${date ? ` (${date})` : ''}`;
      writeWrappedText(certText, { fontSize: 9.5, color: theme.textRGB, indent: 4 });
      y += 2;
    }
  }

  return doc.output('blob');
}
