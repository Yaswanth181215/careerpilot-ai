import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Interview } from '../models/interview.model';
import { Question } from '../models/question.model';
import { Answer } from '../models/answer.model';
import { Report } from '../models/report.model';
import { User } from '../models/user.model';
import { InterviewAgent, RecruiterAgent, BehavioralAnalysisAgent } from '../services/ai.service';
import { AppEventBus, AppEventNames, ValidationError, NotFoundError } from '@careerpilot/shared';

export class InterviewController {
  public static async start(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { domain, difficulty, experienceLevel } = req.body;
      const userId = req.user?.userId;

      if (!userId) throw new ValidationError('User session is invalid');

      // Call Gemini InterviewAgent to generate dynamic questions
      const aiResponse = await InterviewAgent.generateQuestions(domain, difficulty, experienceLevel);
      const generatedQuestions = aiResponse.questions;

      if (!generatedQuestions || !Array.isArray(generatedQuestions)) {
        throw new Error('AI failed to generate structural questions');
      }

      // Create Parent Interview Document
      const interview = new Interview({
        userId,
        domain,
        difficulty,
        experienceLevel,
        status: 'In-Progress',
      });
      await interview.save();

      // Create Questions Documents
      const questionDocs = [];
      for (const q of generatedQuestions) {
        const question = new Question({
          interviewId: interview._id,
          questionText: q.questionText,
          expectedAnswer: q.expectedAnswer,
        });
        await question.save();
        questionDocs.push(question);
      }

      res.status(201).json({
        success: true,
        interviewId: interview._id,
        questions: questionDocs.map((q) => ({ id: q._id, questionText: q.questionText })),
      });
    } catch (error) {
      next(error);
    }
  }

  public static async submitAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { interviewId, questionId, userAnswerText, audioUrl } = req.body;

      const question = await Question.findById(questionId);
      if (!question) throw new NotFoundError('Question not found');

      // Call Gemini Recruiter & Behavioral Analysis Agents to score answer
      const evalResponse = await RecruiterAgent.evaluateBehavioral(question.questionText, userAnswerText);
      const behaviorResponse = await BehavioralAnalysisAgent.analyzeBehavior(userAnswerText);

      // Save Answer
      const answer = new Answer({
        interviewId,
        questionId,
        userAnswerText,
        audioUrl,
        technicalAccuracyScore: evalResponse.hrScore || evalResponse.recruitabilityScore || 70,
        communicationScore: evalResponse.communicationScore || behaviorResponse.communicationScore || 75,
        confidenceScore: evalResponse.confidenceScore || behaviorResponse.confidenceScore || 80,
        feedbackText: evalResponse.feedback || 'Good attempt.',
      });
      await answer.save();

      res.json({
        success: true,
        scores: {
          technical: answer.technicalAccuracyScore,
          communication: answer.communicationScore,
          confidence: answer.confidenceScore,
        },
        feedback: answer.feedbackText,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { interviewId } = req.body;
      const userId = req.user?.userId;

      const interview = await Interview.findById(interviewId);
      if (!interview) throw new NotFoundError('Interview not found');

      const answers = await Answer.find({ interviewId });
      if (answers.length === 0) {
        throw new ValidationError('No answers have been submitted for this interview');
      }

      // Calculate averages
      const avgTech = answers.reduce((acc, curr) => acc + curr.technicalAccuracyScore, 0) / answers.length;
      const avgComm = answers.reduce((acc, curr) => acc + curr.communicationScore, 0) / answers.length;
      const avgConf = answers.reduce((acc, curr) => acc + curr.confidenceScore, 0) / answers.length;
      const overall = Math.round((avgTech + avgComm + avgConf) / 3);

      // Create report
      const report = new Report({
        interviewId,
        overallScore: overall,
        technicalScore: Math.round(avgTech),
        communicationScore: Math.round(avgComm),
        confidenceScore: Math.round(avgConf),
        summary: `Interview completed in ${interview.domain}. Evaluated answers demonstrate moderate skill competency.`,
        strengths: ['Problem Identification', 'Communication Clarity'],
        weaknesses: ['Technical Syntax Depths', 'Filler words containment'],
        recommendations: ['Revise core data structures', 'Focus on speech pauses'],
      });
      await report.save();

      // Update interview status
      interview.status = 'Completed';
      await interview.save();

      // Update user XP & Level
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.xp += 100; // Complete interview gives 100 XP
          user.level = Math.floor(user.xp / 500) + 1; // 500 XP per level
          await user.save();
        }
      }

      // Publish INTERVIEW_COMPLETED event to EventBus
      await AppEventBus.publish(AppEventNames.INTERVIEW_COMPLETED, {
        userId,
        interviewId,
        domain: interview.domain,
        score: overall,
      });

      res.json({
        success: true,
        reportId: report._id,
        scores: {
          overall: report.overallScore,
          technical: report.technicalScore,
          communication: report.communicationScore,
          confidence: report.confidenceScore,
        },
        summary: report.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const list = await Interview.find({ userId }).sort({ createdAt: -1 });
      res.json({ success: true, interviews: list });
    } catch (error) {
      next(error);
    }
  }

  public static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const report = await Report.findOne({ interviewId: id });
      if (!report) throw new NotFoundError('Report not found for this interview');
      res.json({ success: true, report });
    } catch (error) {
      next(error);
    }
  }
}
