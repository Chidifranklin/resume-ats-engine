import { StructuredCV, StructuredJob, ATSAnalysisResult, StructuredCV as StructCV } from '../types';

export const DEMO_ORIGINAL_CV: StructuredCV = {
  id: 'demo-cv-1',
  title: 'Alex Taylor - Data Analyst CV',
  personalInfo: {
    fullName: 'Alex Taylor',
    email: 'alex.taylor@email.com',
    phone: '+1 (555) 234-5678',
    location: 'Chicago, IL',
    linkedin: 'linkedin.com/in/alextaylor-data',
    github: 'github.com/alextaylor-analytics',
  },
  summary: 'Data Analyst with 3 years of experience working with business datasets. Experienced in SQL queries, Excel spreadsheets, and basic dashboard creation. Looking to leverage data visualization and business analytics skills in a growth-oriented company.',
  coreCompetencies: [
    'Data Analysis',
    'SQL Querying',
    'Excel & Formulas',
    'Power BI',
    'Data Cleaning',
    'Business Reporting'
  ],
  technicalSkills: [
    {
      category: 'Database & SQL',
      skills: ['PostgreSQL', 'MySQL', 'SQL Joins & Aggregations']
    },
    {
      category: 'Analytics & BI Tools',
      skills: ['Microsoft Excel (VLOOKUP, Pivot Tables)', 'Power BI', 'Google Analytics']
    },
    {
      category: 'Programming & Scripts',
      skills: ['Python (Pandas, basic scripting)']
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Apex Logistics Inc.',
      jobTitle: 'Junior Data Analyst',
      location: 'Chicago, IL',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      description: 'Worked with shipping and supply chain datasets to generate daily operational reports for managers.',
      achievements: [
        'Created weekly Excel reports tracking shipment transit times and delays across 12 regional hubs.',
        'Wrote SQL queries to extract raw operational records from PostgreSQL database.',
        'Built a Power BI dashboard showing key shipping metrics for logistics team.',
        'Cleaned customer address data to improve delivery routing accuracy.'
      ],
      technologies: ['SQL', 'Excel', 'Power BI', 'PostgreSQL']
    },
    {
      id: 'exp-2',
      company: 'Metro Retail Group',
      jobTitle: 'Data Operations Coordinator',
      location: 'Chicago, IL',
      startDate: '2021-06',
      endDate: '2022-12',
      isCurrent: false,
      description: 'Assisted retail merchandising team with inventory reporting and point-of-sale data entry.',
      achievements: [
        'Maintained daily inventory spreadsheet covering over 2,000 SKUs.',
        'Identified stock discrepancy trends using Excel pivot tables.',
        'Collaborated with store managers to standardise weekly inventory intake logs.'
      ],
      technologies: ['Excel', 'MS Access']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Customer Churn Analysis Project',
      role: 'Lead Analyst',
      startDate: '2023-08',
      endDate: '2023-10',
      description: 'Personal project analyzing customer churn factors for a telecom dataset.',
      achievements: [
        'Used Python Pandas to clean and transform 10,000+ customer records.',
        'Identified top 3 churn drivers including contract length and customer support ticket frequency.',
        'Visualized insights in Power BI dashboard.'
      ],
      technologies: ['Python', 'Pandas', 'Power BI']
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Illinois at Chicago',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Information & Decision Sciences',
      startDate: '2017-09',
      endDate: '2021-05',
      gpa: '3.6 / 4.0',
      location: 'Chicago, IL'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Google Data Analytics Professional Certificate',
      issuer: 'Coursera / Google',
      date: '2022-03'
    }
  ],
  additionalInformation: [
    'Member of Chicago Data Science Meetup',
    'Fluent in English, conversational Spanish'
  ],
  rawText: `Alex Taylor
alex.taylor@email.com | +1 (555) 234-5678 | Chicago, IL
linkedin.com/in/alextaylor-data | github.com/alextaylor-analytics

SUMMARY
Data Analyst with 3 years of experience working with business datasets. Experienced in SQL queries, Excel spreadsheets, and basic dashboard creation. Looking to leverage data visualization and business analytics skills in a growth-oriented company.

CORE COMPETENCIES
Data Analysis, SQL Querying, Excel & Formulas, Power BI, Data Cleaning, Business Reporting

TECHNICAL SKILLS
- Database & SQL: PostgreSQL, MySQL, SQL Joins & Aggregations
- Analytics & BI Tools: Microsoft Excel (VLOOKUP, Pivot Tables), Power BI, Google Analytics
- Programming: Python (Pandas, basic scripting)

EXPERIENCE
Apex Logistics Inc. | Chicago, IL
Junior Data Analyst | Jan 2023 - Present
- Created weekly Excel reports tracking shipment transit times and delays across 12 regional hubs.
- Wrote SQL queries to extract raw operational records from PostgreSQL database.
- Built a Power BI dashboard showing key shipping metrics for logistics team.
- Cleaned customer address data to improve delivery routing accuracy.

Metro Retail Group | Chicago, IL
Data Operations Coordinator | Jun 2021 - Dec 2022
- Maintained daily inventory spreadsheet covering over 2,000 SKUs.
- Identified stock discrepancy trends using Excel pivot tables.
- Collaborated with store managers to standardise weekly inventory intake logs.

PROJECTS
Customer Churn Analysis Project
- Used Python Pandas to clean and transform 10,000+ customer records.
- Identified top 3 churn drivers including contract length and customer support ticket frequency.
- Visualized insights in Power BI dashboard.

EDUCATION
University of Illinois at Chicago | Chicago, IL
Bachelor of Science in Information & Decision Sciences | May 2021

CERTIFICATIONS
Google Data Analytics Professional Certificate (Coursera / Google, Mar 2022)
`
};

export const DEMO_JOB_DESCRIPTION: StructuredJob = {
  id: 'demo-job-1',
  jobTitle: 'Senior Data & Analytics Specialist',
  company: 'Nova Enterprise Solutions',
  rawText: `Job Title: Senior Data & Analytics Specialist
Company: Nova Enterprise Solutions
Location: Chicago, IL (Hybrid)

About the Role:
We are looking for a results-driven Data & Analytics Specialist to transform complex operational datasets into actionable business intelligence. You will write advanced SQL queries, design interactive Power BI dashboards, perform statistical data modeling, and communicate data stories to executive leadership.

Key Responsibilities:
- Design, develop, and deploy automated Power BI reports and executive dashboards.
- Author complex SQL queries, window functions, and subqueries to extract data from multi-terabyte data warehouses (Snowflake / PostgreSQL).
- Perform exploratory data analysis and predictive data modeling to uncover revenue and cost efficiency opportunities.
- Partner with cross-functional stakeholders (Finance, Operations, Marketing) to translate business questions into quantitative analytical requirements.
- Establish data quality frameworks, validation routines, and ETL pipeline monitoring.
- Present quarterly performance insights and data story decks to senior management.

Required Qualifications & Skills:
- 3+ years of experience in Data Analysis, Business Intelligence, or Analytics engineering.
- Mastery of SQL (complex joins, CTEs, window functions, query performance optimization).
- Advanced proficiency in Power BI (DAX measures, data modeling, automated report refreshing).
- Expertise in Microsoft Excel (advanced formulas, Power Query, macro automation).
- Proficiency in Python or R for statistical analysis and data transformation (Pandas, NumPy).
- Strong knowledge of Data Modeling principles (Star schema, Snowflake schema).
- Hands-on experience with Stakeholder Management and Executive Reporting.
- Bachelor's degree in Data Analytics, Computer Science, Statistics, Information Systems, or related field.

Preferred Qualifications:
- Experience with Tableau or Looker visual reporting tools.
- Experience with Cloud Data Warehouses like Snowflake, BigQuery, or Amazon Redshift.
- Certified Data Analyst or AWS/Azure Data Fundamentals certification.
`,
  requiredSkills: [
    'SQL',
    'Power BI',
    'Data Analysis',
    'Excel',
    'Python',
    'Data Modeling',
    'DAX',
    'ETL Pipeline',
    'Stakeholder Management',
    'Executive Reporting'
  ],
  preferredSkills: [
    'Tableau',
    'Snowflake',
    'Looker',
    'BigQuery',
    'DAX Optimization',
    'Data Quality Frameworks'
  ],
  responsibilities: [
    'Design, develop, and deploy automated Power BI reports and executive dashboards.',
    'Author complex SQL queries, window functions, and subqueries.',
    'Perform exploratory data analysis and data modeling.',
    'Partner with cross-functional stakeholders (Finance, Operations).',
    'Establish data quality frameworks and ETL pipeline monitoring.',
    'Present quarterly performance insights to senior management.'
  ],
  educationRequirements: [
    "Bachelor's degree in Data Analytics, Computer Science, Statistics, Information Systems, or related field"
  ],
  certifications: [
    'Certified Data Analyst (Preferred)'
  ],
  experienceRequirements: [
    '3+ years of experience in Data Analysis or Business Intelligence'
  ],
  industryKeywords: [
    'Business Intelligence',
    'Supply Chain Analytics',
    'Executive Reporting',
    'Data Warehousing',
    'DAX',
    'Star Schema'
  ],
  softSkills: [
    'Stakeholder Management',
    'Cross-functional Collaboration',
    'Data Storytelling',
    'Problem Solving'
  ],
  technologies: [
    'SQL',
    'PostgreSQL',
    'Snowflake',
    'Power BI',
    'DAX',
    'Excel',
    'Python',
    'Pandas',
    'Tableau'
  ]
};

export const DEMO_ATS_ANALYSIS: ATSAnalysisResult = {
  id: 'demo-analysis-1',
  overallScore: 68,
  matchLabel: 'Moderate Match',
  dimensionScores: {
    keywordScore: 16,     // out of 25
    skillsScore: 14,      // out of 20
    experienceScore: 13,  // out of 20
    educationScore: 9,   // out of 10
    jobTitleScore: 6,    // out of 10
    achievementsScore: 3, // out of 5
    formattingScore: 7    // out of 10
  },
  keywordAnalysis: [
    {
      keyword: 'SQL',
      importance: 'Required',
      status: 'MATCHED',
      evidence: 'Included in Technical Skills and Apex Logistics experience bullet.',
      recommendation: 'Highlight advanced techniques like CTEs or Window Functions if practiced.'
    },
    {
      keyword: 'Power BI',
      importance: 'Required',
      status: 'MATCHED',
      evidence: 'Built Power BI dashboards in Apex Logistics role and churn project.',
      recommendation: 'Mention DAX or automated data refreshing to match job requirements.'
    },
    {
      keyword: 'Data Modeling',
      importance: 'Required',
      status: 'MISSING',
      evidence: 'Not explicitly listed in original CV.',
      recommendation: 'Only add if you have experience organizing schemas or tables.'
    },
    {
      keyword: 'DAX',
      importance: 'Required',
      status: 'MISSING',
      evidence: 'Missing from Power BI section.',
      recommendation: 'Add DAX calculated columns/measures if you wrote them in Power BI.'
    },
    {
      keyword: 'Python & Pandas',
      importance: 'Required',
      status: 'PARTIAL',
      evidence: 'Listed under projects but missing from professional experience achievements.',
      recommendation: 'Incorporate Python data transformation into core competency or experience bullets.'
    },
    {
      keyword: 'Tableau',
      importance: 'Preferred',
      status: 'MISSING',
      evidence: 'Not mentioned in CV.',
      recommendation: 'Do not add unless user confirms experience.'
    },
    {
      keyword: 'Stakeholder Management',
      importance: 'Required',
      status: 'PARTIAL',
      evidence: 'Implied by collaboration with store managers, but term missing.',
      recommendation: 'Incorporate phrase "cross-functional stakeholder management" truthfully.'
    }
  ],
  skillsAnalysis: {
    matched: ['SQL', 'Power BI', 'Microsoft Excel', 'Python', 'PostgreSQL', 'Data Cleaning'],
    partial: ['Stakeholder Management', 'Data Reporting', 'Statistical Scripting'],
    missing: ['Data Modeling', 'DAX', 'Snowflake', 'ETL Pipeline', 'Tableau', 'Star Schema']
  },
  experienceAnalysis: {
    matchLevel: 'Moderate',
    details: [
      'Candidate has 3 years total experience matching the minimum timeframe requirement.',
      'Target job requires Senior-level leadership and complex query design (CTEs, Window Functions) which are undersold in current Junior Data Analyst wording.',
      'Achievements lack quantified impact metrics (e.g. % time saved, dataset volume, executive audience).'
    ],
    missingRequirements: [
      'Data modeling and schema design',
      'Executive performance presentation experience',
      'Snowflake/Cloud data warehouse exposure'
    ]
  },
  educationAnalysis: {
    matchLevel: 'Strong',
    details: "Bachelor's degree in Information & Decision Sciences directly satisfies required education qualification."
  },
  certificationAnalysis: {
    matchLevel: 'Strong',
    details: 'Google Data Analytics Professional Certificate provides valid technical credibility.'
  },
  formattingAnalysis: {
    isSingleColumn: true,
    hasTablesOrGraphics: false,
    issues: [
      'Section headers could be standardized for cleaner ATS parser tokenization.',
      'Skill section formatting uses bulleted sub-lists that can be consolidated into standard core skill blocks.'
    ],
    score: 7
  },
  topImprovements: [
    'Incorporate DAX and Data Modeling if genuinely experienced',
    'Rephrase Junior title bullet points to focus on quantitative analytical methodology',
    'Strengthen SQL description with explicit query complexities (joins, aggregations)',
    'Incorporate explicit stakeholder communication and executive presentation terminology'
  ],
  remainingGaps: [
    'Tableau & Snowflake cloud data warehouse experience not demonstrated in CV',
    'Lacks DAX DAX measure formulation evidence in Power BI'
  ],
  recommendations: [
    'Optimize summary statement to position candidacy as a data specialist rather than junior level.',
    'Group core skills cleanly under "Core Technical & Analytical Competencies" to maximize ATS keyword parsing.',
    'Add outcome-focused verbs to Apex Logistics bullet points.'
  ],
  recruiterView: {
    strengths: [
      'Strong core foundational tools (SQL, Excel, Power BI, Python)',
      'Relevant degree in Information & Decision Sciences',
      'Solid progression across logistics and retail analytics domains'
    ],
    gaps: [
      'Current job title is "Junior Data Analyst" whereas target is "Senior Specialist"',
      'No mention of enterprise cloud tools like Snowflake or Tableau',
      'Lacks explicit mention of DAX or Star Schema data modeling'
    ],
    summary: 'Candidate shows strong potential with 3 years of hands-on SQL and Power BI experience. CV needs strategic positioning alignment to match Senior role requirements.'
  }
};
