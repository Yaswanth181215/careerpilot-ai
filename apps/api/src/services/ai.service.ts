import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@careerpilot/shared';

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY || 'MOCK_DEVELOPER_KEY_CAREERPILOT';
const genAI = new GoogleGenerativeAI(apiKey === 'MOCK_DEVELOPER_KEY_CAREERPILOT' ? 'AIzaSyMockKeyForDevelopmentOnly' : apiKey);

// In-memory cache for agent responses to optimize token consumption
const responseCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

export class AIGateway {
  public static async execute(
    agentName: string,
    prompt: string,
    systemInstruction: string,
    useCache = true
  ): Promise<any> {
    const cacheKey = `${agentName}:${Buffer.from(prompt).toString('base64').substring(0, 100)}`;
    
    if (useCache) {
      const cached = responseCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        logger.info(`[AIGateway] Cache HIT for agent: ${agentName}`);
        return cached.data;
      }
    }

    let retries = 3;
    while (retries > 0) {
      try {
        logger.info(`[AIGateway] Dispatching prompt to agent: ${agentName}`);
        
        // Use gemini-1.5-flash as the default fast and capable model
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (useCache) {
          responseCache.set(cacheKey, {
            data: parsed,
            expiry: Date.now() + CACHE_TTL,
          });
        }

        return parsed;
      } catch (error: any) {
        retries--;
        logger.error(`[AIGateway] Error in ${agentName} (Retries left: ${retries}):`, { error: error.message });
        if (retries === 0) {
          // Return a structured fallback object in case of complete API failure
          return this.getFallbackResponse(agentName);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private static getFallbackResponse(agentName: string): any {
    logger.warn(`[AIGateway] Returning static fallback response for agent: ${agentName}`);
    switch (agentName) {
      case 'InterviewAgent':
        return {
          questions: [
            { questionText: 'Explain the difference between SQL and NoSQL databases.', expectedAnswer: 'SQL is relational, NoSQL is non-relational.' },
            { questionText: 'What is a closure in JavaScript?', expectedAnswer: 'A function that remembers its outer variables.' }
          ]
        };
      case 'ResumeAgent':
        return {
          atsScore: 70,
          skills: ['JavaScript', 'Node.js', 'React'],
          strengths: ['Clear project descriptions'],
          weaknesses: ['Missing cloud computing details'],
          suggestions: ['Add AWS or GCP certifications']
        };
      case 'ATSAgent':
        return {
          atsScore: 65,
          matchingKeywords: ['React', 'Node.js'],
          missingKeywords: ['Docker', 'TypeScript', 'Kubernetes'],
          optimizationScore: 65
        };
      case 'LinkedInAgent':
        return {
          linkedInScore: 72,
          headlineSuggestion: 'Full Stack Engineer | React | TypeScript | Node.js',
          aboutSuggestion: 'Passionate software engineer building robust SaaS products and real-time platforms.',
          optimizationSuggestions: ['Add links to your portfolio projects']
        };
      case 'RoadmapAgent':
        return {
          title: 'Full Stack Development Learning Path',
          description: 'A structural guide to web development.',
          durationWeeks: 4,
          weeklyPlan: [
            { week: 1, topic: 'Advanced JavaScript & TypeScript', tasks: ['Study closures', 'Async/Await'], resources: ['MDN Web Docs'] }
          ]
        };
      case 'JobMatchingAgent':
        return {
          jobMatches: [
            { jobTitle: 'Frontend Engineer', companyName: 'Vercel', location: 'Remote', matchPercentage: 88 }
          ]
        };
      default:
        return { message: 'AI gateway request processed with fallback handler.' };
    }
  }
}

// --- SPECIALIZED AGENT IMPLEMENTATIONS ---

export class InterviewAgent {
  private static systemInstruction = `
    You are an elite Tech Interviewer. Generate a list of questions based on a domain, difficulty, and experience level.
    You MUST output valid JSON only. Format:
    {
      "questions": [
        {
          "questionText": "Question description",
          "expectedAnswer": "Brief points of the correct answer"
        }
      ]
    }
  `;

  public static async generateQuestions(domain: string, difficulty: string, experience: string): Promise<any> {
    const prompt = `Generate 5 technical interview questions for domain: ${domain}, difficulty level: ${difficulty}, target role experience: ${experience}.`;
    return AIGateway.execute('InterviewAgent', prompt, this.systemInstruction);
  }
}

export class ResumeAgent {
  private static systemInstruction = `
    You are an expert Resume Analyst and Recruiter. Parse the extracted resume text and evaluate it.
    You MUST output valid JSON only. Format:
    {
      "atsScore": 85,
      "skills": ["React", "TypeScript", "Node.js"],
      "experience": [
        { "role": "Software Engineer", "company": "Stripe", "duration": "2 years", "description": "Built core APIs" }
      ],
      "education": [
        { "degree": "B.Tech CSE", "school": "IIT", "year": "2024" }
      ],
      "strengths": ["Strong engineering metrics listed"],
      "weaknesses": ["Lack of testing frameworks listed"],
      "suggestions": ["Include unit testing details for projects"]
    }
  `;

  public static async analyzeResume(text: string): Promise<any> {
    const prompt = `Analyze this resume content:\n${text}`;
    return AIGateway.execute('ResumeAgent', prompt, this.systemInstruction);
  }
}

export class ATSAgent {
  private static systemInstruction = `
    You are an ATS (Applicant Tracking System) Scanner. Compare the resume text with the job description.
    You MUST output valid JSON only. Format:
    {
      "atsScore": 75,
      "matchingKeywords": ["React", "Redux"],
      "missingKeywords": ["GraphQL", "Docker"],
      "optimizationSuggestions": ["Incorporate GraphQL into project accomplishments"]
    }
  `;

  public static async scoreMatch(resumeText: string, jobDescription: string): Promise<any> {
    const prompt = `Compare this resume:\n${resumeText}\nWith this job description:\n${jobDescription}`;
    return AIGateway.execute('ATSAgent', prompt, this.systemInstruction);
  }
}

export class LinkedInAgent {
  private static systemInstruction = `
    You are a professional LinkedIn Branding Consultant. Analyze the profile copy or exported text.
    You MUST output valid JSON only. Format:
    {
      "linkedInScore": 80,
      "recruiterAttractionScore": 85,
      "missingKeywords": ["CI/CD", "Tailwind CSS"],
      "headlineSuggestion": "Staff Software Engineer | Distributed Systems & Scaling",
      "aboutSuggestion": "Building next-gen systems at high-scale.",
      "optimizationSuggestions": ["Enhance project impact metrics"]
    }
  `;

  public static async analyzeProfile(text: string): Promise<any> {
    const prompt = `Analyze this LinkedIn profile content:\n${text}`;
    return AIGateway.execute('LinkedInAgent', prompt, this.systemInstruction);
  }
}

export class CareerCoachAgent {
  private static systemInstruction = `
    You are an empathetic, expert AI Career Coach. Help the user with career questions.
    You MUST output valid JSON only. Format:
    {
      "guidanceText": "Coach advice description",
      "actionItems": ["Join open source", "Practice mock interviews"],
      "recommendedResources": ["System Design Primer GitHub repo"]
    }
  `;

  public static async askCoach(chatHistory: string, userMessage: string): Promise<any> {
    const prompt = `History:\n${chatHistory}\nUser: ${userMessage}\nAnswer as coach.`;
    return AIGateway.execute('CareerCoachAgent', prompt, this.systemInstruction);
  }
}

export class RoadmapAgent {
  private static systemInstruction = `
    You are a Career Roadmap Architect. Generate a weekly structured plan based on career goals and skills.
    You MUST output valid JSON only. Format:
    {
      "title": "Learning roadmap title",
      "description": "roadmap description",
      "durationWeeks": 4,
      "weeklyPlan": [
        {
          "week": 1,
          "topic": "Week Topic",
          "tasks": ["Task 1", "Task 2"],
          "resources": ["Resource Link 1"],
          "projectIdea": "Build a small CLI tool"
        }
      ]
    }
  `;

  public static async generateRoadmap(goal: string, currentSkills: string[]): Promise<any> {
    const prompt = `Create a 4-week roadmap for goal: ${goal}, current skills: ${currentSkills.join(', ')}`;
    return AIGateway.execute('RoadmapAgent', prompt, this.systemInstruction);
  }
}

export class JobMatchingAgent {
  private static systemInstruction = `
    You are a Smart Job Matching Recruiter. Recommend jobs based on resume skills and profile scores.
    You MUST output valid JSON only. Format:
    {
      "jobMatches": [
        {
          "jobTitle": "Job Title",
          "companyName": "Company Name",
          "location": "Location",
          "matchPercentage": 90,
          "matchingSkills": ["React", "Express"],
          "missingSkills": ["TypeScript"],
          "recommendedResources": ["TypeScript Deep Dive book"]
        }
      ]
    }
  `;

  public static async matchJobs(skills: string[], goal: string): Promise<any> {
    const prompt = `Recommend jobs matching skills: ${skills.join(', ')} and career goals: ${goal}`;
    return AIGateway.execute('JobMatchingAgent', prompt, this.systemInstruction);
  }
}

export class RecruiterAgent {
  private static systemInstruction = `
    You are a Senior HR Talent Recruiter. Evaluate behavioral answers using the STAR method.
    You MUST output valid JSON only. Format:
    {
      "hrScore": 85,
      "recruitabilityScore": 90,
      "communicationScore": 80,
      "confidenceScore": 85,
      "starEvaluation": "STAR method analysis detail",
      "feedback": "Improve action description details"
    }
  `;

  public static async evaluateBehavioral(question: string, answer: string): Promise<any> {
    const prompt = `Evaluate answer for behavioral question:\nQuestion: ${question}\nAnswer: ${answer}`;
    return AIGateway.execute('RecruiterAgent', prompt, this.systemInstruction);
  }
}

export class RecommendationAgent {
  private static systemInstruction = `
    You are a Personalized Learning Coach. Suggest project ideas and learning steps based on performance records.
    You MUST output valid JSON only. Format:
    {
      "projectRecommendations": [
        { "title": "Project Title", "difficulty": "Medium", "techStack": ["React", "Socket.io"], "description": "Real-time editor" }
      ],
      "courseRecommendations": ["Node.js Security course"]
    }
  `;

  public static async getRecommendations(weakAreas: string[], strongAreas: string[]): Promise<any> {
    const prompt = `Recommend projects for weak areas: ${weakAreas.join(', ')} capitalizing on strengths: ${strongAreas.join(', ')}`;
    return AIGateway.execute('RecommendationAgent', prompt, this.systemInstruction);
  }
}

export class BehavioralAnalysisAgent {
  private static systemInstruction = `
    You are a speech, communication, and behavioral psychologist. Analyze transcripts for communication pace and confidence.
    You MUST output valid JSON only. Format:
    {
      "confidenceScore": 80,
      "communicationScore": 85,
      "behavioralScore": 90,
      "presentationScore": 85,
      "fillerWordsFound": ["like", "um"],
      "suggestions": ["Pause slightly to avoid using filler words"]
    }
  `;

  public static async analyzeBehavior(transcript: string): Promise<any> {
    const prompt = `Analyze this transcripts for behavioral metrics:\n${transcript}`;
    return AIGateway.execute('BehavioralAnalysisAgent', prompt, this.systemInstruction);
  }
}
