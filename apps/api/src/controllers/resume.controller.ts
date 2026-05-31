import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Resume } from '../models/resume.model';
import { ResumeAgent } from '../services/ai.service';
import { AppEventBus, AppEventNames, ValidationError, NotFoundError } from '@careerpilot/shared';
import pdf from 'pdf-parse';
import fs from 'fs';

export class ResumeController {
  public static async analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const userId = req.user?.userId;

      if (!userId) throw new ValidationError('Invalid session user');
      if (!file) throw new ValidationError('Please upload a resume file in PDF format');

      // Read PDF buffer and extract text
      const buffer = fs.readFileSync(file.path);
      const pdfData = await pdf(buffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        throw new ValidationError('Could not extract text content from the uploaded PDF');
      }

      // Call Gemini ResumeAgent
      const aiAnalysis = await ResumeAgent.analyzeResume(text);

      // Generate a mock 768-dimension float array for MongoDB Atlas Vector Search
      const mockEmbedding = Array.from({ length: 768 }, () => Math.random() * 2 - 1);

      // Create Mongoose Document
      const resume = new Resume({
        userId,
        fileName: file.originalname,
        fileUrl: `/uploads/resumes/${file.filename}`,
        extractedText: text,
        embeddings: mockEmbedding,
        atsScore: aiAnalysis.atsScore || 70,
        skills: aiAnalysis.skills || [],
        experience: aiAnalysis.experience || [],
        education: aiAnalysis.education || [],
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        suggestions: aiAnalysis.suggestions || [],
      });
      await resume.save();

      // Delete the local uploaded temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Publish RESUME_UPLOADED event
      await AppEventBus.publish(AppEventNames.RESUME_UPLOADED, {
        userId,
        resumeId: resume._id,
        skills: resume.skills,
        atsScore: resume.atsScore,
      });

      res.json({
        success: true,
        resumeId: resume._id,
        fileName: resume.fileName,
        atsScore: resume.atsScore,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        strengths: resume.strengths,
        weaknesses: resume.weaknesses,
        suggestions: resume.suggestions,
      });
    } catch (error) {
      // Cleanup file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  public static async getLatest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const latest = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      if (!latest) {
        throw new NotFoundError('No resumes found for this user');
      }
      res.json({ success: true, resume: latest });
    } catch (error) {
      next(error);
    }
  }
}
