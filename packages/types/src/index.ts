export type UserRole = 'Student' | 'Mentor' | 'Admin' | 'Super Admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshTokens?: string[];
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InterviewDomain =
  | 'DSA'
  | 'DBMS'
  | 'Operating Systems'
  | 'Computer Networks'
  | 'OOP'
  | 'Java'
  | 'Python'
  | 'JavaScript'
  | 'React'
  | 'Node.js'
  | 'Machine Learning'
  | 'Data Science'
  | 'AI/ML'
  | 'Cloud Computing'
  | 'Cyber Security'
  | 'System Design'
  | 'HR Interview';

export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ExperienceLevel = 'Fresher' | 'Intermediate' | 'Advanced';
export type InterviewStatus = 'Scheduled' | 'In-Progress' | 'Completed';

export interface IQuestion {
  _id: string;
  interviewId: string;
  questionText: string;
  expectedAnswer?: string;
  createdAt?: Date;
}

export interface IAnswer {
  _id: string;
  interviewId: string;
  questionId: string;
  userAnswerText: string;
  audioUrl?: string;
  technicalAccuracyScore: number;
  communicationScore: number;
  confidenceScore: number;
  feedbackText: string;
  createdAt?: Date;
}

export interface IInterview {
  _id: string;
  userId: string;
  domain: InterviewDomain;
  difficulty: InterviewDifficulty;
  experienceLevel: ExperienceLevel;
  status: InterviewStatus;
  videoUrl?: string;
  questions?: IQuestion[];
  answers?: IAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport {
  _id: string;
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface ICodingSubmission {
  _id: string;
  userId: string;
  problemId: string;
  language: 'python' | 'java' | 'cpp' | 'javascript';
  code: string;
  runtime: number; // in ms
  memory: number; // in KB
  passed: boolean;
  results: {
    testCaseId: string;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
  }[];
  createdAt: Date;
}

export interface IResume {
  _id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  embeddings?: number[];
  atsScore: number;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  createdAt: Date;
}

export interface ILinkedInAnalysis {
  _id: string;
  userId: string;
  rawText: string;
  linkedInScore: number;
  recruiterAttractionScore: number;
  missingKeywords: string[];
  optimizationSuggestions: string[];
  headlineSuggestion: string;
  aboutSuggestion: string;
  createdAt: Date;
}

export interface IFeatureFlag {
  _id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  allowedRoles: UserRole[];
  allowedUsers: string[];
}

export interface IAuditLog {
  _id: string;
  userId?: string;
  action: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface ILearningRoadmap {
  _id: string;
  userId: string;
  title: string;
  description: string;
  durationWeeks: number;
  weeklyPlan: {
    week: number;
    topic: string;
    tasks: string[];
    resources: string[];
    projectIdea?: string;
  }[];
  createdAt: Date;
}

export interface IJobRecommendation {
  _id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedResources: string[];
  jobEmbeddings?: number[];
  createdAt: Date;
}
