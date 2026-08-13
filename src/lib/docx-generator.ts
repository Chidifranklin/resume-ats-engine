/**
 * ATS CV Optimizer - Professional DOCX Document Generator
 * Uses 'docx' package to create genuine Microsoft Word documents (.docx)
 * compatible with ATS parsers and Word 2016+.
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
  TabStopType,
  TabStopPosition,
} from 'docx';
import { StructuredCV, CVTemplateId } from '../types';
import { normalizeCV } from './cvNormalizer';

interface TemplateStyle {
  font: string;
  primaryColor: string;
  secondaryColor: string;
  headerAlignment: (typeof AlignmentType)[keyof typeof AlignmentType];
  headerSize: number;
  bodySize: number;
}

const TEMPLATE_STYLES: Record<CVTemplateId, TemplateStyle> = {
  classic: {
    font: 'Times New Roman',
    primaryColor: '111827', // dark gray/black
    secondaryColor: '374151',
    headerAlignment: AlignmentType.CENTER,
    headerSize: 28, // 14pt
    bodySize: 21,   // 10.5pt
  },
  modern: {
    font: 'Calibri',
    primaryColor: '1E3A8A', // deep navy blue
    secondaryColor: '1F2937',
    headerAlignment: AlignmentType.LEFT,
    headerSize: 28,
    bodySize: 22,
  },
  corporate: {
    font: 'Arial',
    primaryColor: '0F172A', // slate 900
    secondaryColor: '334155',
    headerAlignment: AlignmentType.LEFT,
    headerSize: 28,
    bodySize: 21,
  },
  technical: {
    font: 'Arial',
    primaryColor: '047857', // emerald 700
    secondaryColor: '1F2937',
    headerAlignment: AlignmentType.LEFT,
    headerSize: 28,
    bodySize: 21,
  },
  executive: {
    font: 'Georgia',
    primaryColor: '4C1D95', // purple 900
    secondaryColor: '312E81',
    headerAlignment: AlignmentType.CENTER,
    headerSize: 30,
    bodySize: 22,
  },
};

export async function generateDocxBlob(
  rawCv: StructuredCV,
  templateId: CVTemplateId = 'classic'
): Promise<Blob> {
  const cv = normalizeCV(rawCv);
  const style = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.classic;

  const children: Paragraph[] = [];

  // 1. Header Section - Name
  children.push(
    new Paragraph({
      alignment: style.headerAlignment,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: cv.personalInfo.fullName.toUpperCase(),
          bold: true,
          font: style.font,
          size: style.headerSize,
          color: style.primaryColor,
        }),
      ],
    })
  );

  // Contact Info Line
  const contactLine = [
    cv.personalInfo.location,
    cv.personalInfo.phone,
    cv.personalInfo.email,
    cv.personalInfo.linkedin,
    cv.personalInfo.github,
    cv.personalInfo.portfolio,
  ]
    .filter(Boolean)
    .join('  |  ');

  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: style.headerAlignment,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactLine,
            font: style.font,
            size: 19, // 9.5pt
            color: style.secondaryColor,
          }),
        ],
      })
    );
  }

  // Helper to create Section Headings
  const createSectionHeading = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: style.primaryColor,
          space: 1,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          font: style.font,
          size: 22, // 11pt
          color: style.primaryColor,
        }),
      ],
    });
  };

  // 2. Professional Summary
  if (cv.summary) {
    children.push(createSectionHeading('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: cv.summary,
            font: style.font,
            size: style.bodySize,
          }),
        ],
      })
    );
  }

  // 3. Core Competencies & Skills
  if (cv.coreCompetencies && cv.coreCompetencies.length > 0) {
    children.push(createSectionHeading('Core Competencies'));
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: cv.coreCompetencies.join('  •  '),
            bold: true,
            font: style.font,
            size: style.bodySize,
            color: style.secondaryColor,
          }),
        ],
      })
    );
  }

  // Technical Skills Category
  if (Array.isArray(cv.technicalSkills) && cv.technicalSkills.length > 0) {
    children.push(createSectionHeading('Technical Skills'));

    if (typeof cv.technicalSkills[0] === 'string') {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: (cv.technicalSkills as string[]).join(', '),
              font: style.font,
              size: style.bodySize,
            }),
          ],
        })
      );
    } else {
      for (const catObj of cv.technicalSkills as { category: string; skills: string[] }[]) {
        if (!catObj || !catObj.category) continue;
        const skillsList = Array.isArray(catObj.skills) ? catObj.skills.join(', ') : String(catObj.skills || '');
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `${catObj.category}: `,
                bold: true,
                font: style.font,
                size: style.bodySize,
                color: style.primaryColor,
              }),
              new TextRun({
                text: skillsList,
                font: style.font,
                size: style.bodySize,
              }),
            ],
          })
        );
      }
    }
  }

  // 4. Professional Experience
  if (cv.experience && cv.experience.length > 0) {
    children.push(createSectionHeading('Professional Experience'));

    for (const exp of cv.experience) {
      const dateText = exp.startDate && exp.endDate
        ? `${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate}`
        : (exp.startDate || exp.endDate || '');

      // Line 1: Job Title & Right-Aligned Date Tab
      children.push(
        new Paragraph({
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { before: 120, after: 20 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              font: style.font,
              size: style.bodySize + 1,
              color: style.primaryColor,
            }),
            dateText
              ? new TextRun({
                  text: `\t${dateText}`,
                  bold: true,
                  font: style.font,
                  size: style.bodySize,
                  color: style.secondaryColor,
                })
              : new TextRun({ text: '' }),
          ],
        })
      );

      // Line 2: Company Name & Location
      const companyLoc = exp.company + (exp.location ? `, ${exp.location}` : '');
      if (companyLoc) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: companyLoc,
                italics: true,
                font: style.font,
                size: style.bodySize,
                color: style.secondaryColor,
              }),
            ],
          })
        );
      }

      if (exp.description) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: exp.description,
                italics: true,
                font: style.font,
                size: style.bodySize - 1,
              }),
            ],
          })
        );
      }

      // Achievements bullets
      if (exp.achievements && exp.achievements.length > 0) {
        for (const bullet of exp.achievements) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: bullet,
                  font: style.font,
                  size: style.bodySize,
                }),
              ],
            })
          );
        }
      }
    }
  }

  // 5. Projects
  if (cv.projects && cv.projects.length > 0) {
    children.push(createSectionHeading('Key Projects'));

    for (const proj of cv.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              font: style.font,
              size: style.bodySize,
              color: style.primaryColor,
            }),
            proj.role
              ? new TextRun({ text: ` (${proj.role})`, italics: true, font: style.font, size: style.bodySize })
              : new TextRun({ text: '' }),
          ],
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: proj.description, font: style.font, size: style.bodySize }),
            ],
          })
        );
      }

      if (proj.achievements) {
        for (const b of proj.achievements) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [new TextRun({ text: b, font: style.font, size: style.bodySize })],
            })
          );
        }
      }
    }
  }

  // 6. Education
  if (cv.education && cv.education.length > 0) {
    children.push(createSectionHeading('Education'));

    for (const edu of cv.education) {
      const dates = edu.startDate && edu.endDate
        ? `${edu.startDate} – ${edu.endDate}`
        : (edu.endDate || edu.startDate || '');

      const degreeTitle = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;

      // Line 1: Degree & Dates
      children.push(
        new Paragraph({
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: degreeTitle,
              bold: true,
              font: style.font,
              size: style.bodySize,
              color: style.primaryColor,
            }),
            dates
              ? new TextRun({
                  text: `\t${dates}`,
                  bold: true,
                  font: style.font,
                  size: style.bodySize,
                  color: style.secondaryColor,
                })
              : new TextRun({ text: '' }),
          ],
        })
      );

      // Line 2: Institution & Location
      const instLoc = edu.institution + (edu.location ? `, ${edu.location}` : '');
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: instLoc,
              italics: true,
              font: style.font,
              size: style.bodySize,
              color: style.secondaryColor,
            }),
          ],
        })
      );
    }
  }

  // 7. Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    children.push(createSectionHeading('Certifications & Licenses'));

    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              font: style.font,
              size: style.bodySize,
            }),
            new TextRun({
              text: ` — ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`,
              font: style.font,
              size: style.bodySize,
            }),
          ],
        })
      );
    }
  }

  // Build Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
