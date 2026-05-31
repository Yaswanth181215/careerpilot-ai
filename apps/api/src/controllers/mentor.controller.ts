import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Mentor } from '../models/mentor.model';
import { User } from '../models/user.model';
import { Answer } from '../models/answer.model';
import { ValidationError, NotFoundError } from '@careerpilot/shared';

export class MentorController {
  public static async listMentors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Find all mentors and populate user account details
      const list = await Mentor.find().populate('userId', 'name email');
      res.json({
        success: true,
        mentors: list,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async bookSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mentorId, slot } = req.body;
      const mentor = await Mentor.findById(mentorId);
      
      if (!mentor) throw new NotFoundError('Mentor profile not found');
      
      const parsedSlot = new Date(slot);
      if (isNaN(parsedSlot.getTime())) throw new ValidationError('Invalid date-time format for slot booking');

      // Clear that slot from availability and save booking
      mentor.availability = mentor.availability.filter((d) => d.getTime() !== parsedSlot.getTime());
      await mentor.save();

      res.json({
        success: true,
        message: 'Session slot booked successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { answerId, reviewText, adjustmentScore } = req.body;
      const answer = await Answer.findById(answerId);

      if (!answer) throw new NotFoundError('Student interview answer not found');

      // Mentor updates the score and review feedback
      answer.feedbackText += `\n[Mentor Review]: ${reviewText}`;
      if (adjustmentScore) {
        answer.technicalAccuracyScore = Math.min(answer.technicalAccuracyScore + adjustmentScore, 100);
      }
      await answer.save();

      res.json({
        success: true,
        message: 'Mentor feedback submitted successfully.',
        updatedScore: answer.technicalAccuracyScore,
      });
    } catch (error) {
      next(error);
    }
  }
}
