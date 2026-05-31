import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Roadmap } from '../models/roadmap.model';
import { Resume } from '../models/resume.model';
import { CareerCoachAgent, RoadmapAgent, LinkedInAgent } from '../services/ai.service';
import { ValidationError, NotFoundError } from '@careerpilot/shared';

export class CareerController {
  public static async askCoach(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userMessage, history } = req.body;
      if (!userMessage) throw new ValidationError('Message content is empty');

      const chatHistory = history ? history.map((h: any) => `${h.role}: ${h.text}`).join('\n') : '';

      const coachResponse = await CareerCoachAgent.askCoach(chatHistory, userMessage);
      res.json({
        success: true,
        reply: coachResponse.guidanceText,
        actionItems: coachResponse.actionItems || [],
        resources: coachResponse.recommendedResources || [],
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generateRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goal } = req.body;
      const userId = req.user?.userId;

      if (!userId) throw new ValidationError('Invalid session user');
      if (!goal) throw new ValidationError('Roadmap career goal is required');

      // Fetch user skills from resume if exists to customize roadmap
      const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      const skills = resume ? resume.skills : ['JavaScript'];

      const aiRoadmap = await RoadmapAgent.generateRoadmap(goal, skills);

      const roadmap = new Roadmap({
        userId,
        title: aiRoadmap.title || `Learning Path for ${goal}`,
        description: aiRoadmap.description || 'Custom generated learning track.',
        durationWeeks: aiRoadmap.durationWeeks || 4,
        weeklyPlan: aiRoadmap.weeklyPlan || [],
      });
      await roadmap.save();

      res.status(201).json({
        success: true,
        roadmap,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRoadmaps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const list = await Roadmap.find({ userId }).sort({ createdAt: -1 });
      res.json({ success: true, roadmaps: list });
    } catch (error) {
      next(error);
    }
  }

  public static async analyzeLinkedIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { profileText } = req.body;
      if (!profileText) throw new ValidationError('LinkedIn profile text/copy is required');

      const analysis = await LinkedInAgent.analyzeProfile(profileText);
      res.json({
        success: true,
        linkedInScore: analysis.linkedInScore || 70,
        recruiterAttractionScore: analysis.recruiterAttractionScore || 75,
        missingKeywords: analysis.missingKeywords || [],
        optimizationSuggestions: analysis.optimizationSuggestions || [],
        headlineSuggestion: analysis.headlineSuggestion || '',
        aboutSuggestion: analysis.aboutSuggestion || '',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generatePortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

      if (!resume) {
        throw new NotFoundError('Please upload a resume first to extract portfolio contents');
      }

      // Format markdown portfolio page
      const portfolioContent = `
# Portfolio: ${resume.fileName.replace('.pdf', '')}
## Skills
${resume.skills.map((s) => `- ${s}`).join('\n')}

## Professional Experience
${resume.experience
  .map(
    (exp) => `
### ${exp.role} at ${exp.company} (${exp.duration})
${exp.description}
`
  )
  .join('\n')}

## Education
${resume.education.map((edu) => `- **${edu.degree}** from ${edu.school} (${edu.year})`).join('\n')}
      `.trim();

      res.json({
        success: true,
        portfolio: portfolioContent,
      });
    } catch (error) {
      next(error);
    }
  }
}
