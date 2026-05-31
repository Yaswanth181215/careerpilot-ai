import winston from 'winston';
import { EventEmitter } from 'events';

// --- WINSTON LOGGER CONFIGURATION ---
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// --- CUSTOM ERROR DEFINITIONS ---
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden operation') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

// --- EVENT BUS WITH RETRY & DLQ ---
class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase maximum listener count to prevent warnings
    this.setMaxListeners(50);
  }

  /**
   * Publishes an event to all subscribers with retry capabilities.
   */
  public async publish(
    eventName: string,
    payload: any,
    retries = 3
  ): Promise<void> {
    logger.info(`[EventBus] Publishing event: ${eventName}`, { payload });
    
    const listeners = this.listeners(eventName);
    
    for (const listener of listeners) {
      this.executeListenerWithRetry(listener, eventName, payload, retries);
    }
  }

  private async executeListenerWithRetry(
    listener: Function,
    eventName: string,
    payload: any,
    retriesLeft: number
  ): Promise<void> {
    try {
      await listener(payload);
    } catch (error: any) {
      logger.error(
        `[EventBus] Error executing listener for event ${eventName}. Retries remaining: ${retriesLeft}`,
        { error: error.message }
      );
      
      if (retriesLeft > 0) {
        // Linear backoff logic
        const backoffMs = (4 - retriesLeft) * 1000;
        setTimeout(() => {
          this.executeListenerWithRetry(listener, eventName, payload, retriesLeft - 1);
        }, backoffMs);
      } else {
        logger.error(
          `[EventBus] Dead Letter Queue (DLQ) alert for event ${eventName}. Execution exhausted.`,
          { payload, error: error.message }
        );
        // Emit a general system failure event that can be audited
        this.emit('EVENT_DLQ_ALERT', {
          eventName,
          payload,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }
  }
}

export const AppEventBus = new EventBus();
export const EventDomains = {
  INTERVIEW: 'interview',
  NOTIFICATION: 'notification',
  ACHIEVEMENT: 'achievement',
  ANALYTICS: 'analytics',
  ROADMAP: 'roadmap',
  MENTOR: 'mentor',
  RECOMMENDATION: 'recommendation',
};
export const EventActions = {
  CREATED: 'created',
  UPDATED: 'updated',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
export const getEventKey = (domain: string, action: string) => `${domain}:${action}`;
export const getEventValue = (domain: string, action: string) => `${domain}:${action}`;
export const AppEventNames = {
  INTERVIEW_COMPLETED: getEventValue(EventDomains.INTERVIEW, EventActions.COMPLETED),
  CODING_SUBMITTED: getEventValue(EventDomains.ANALYTICS, 'coding_submitted'),
  RESUME_UPLOADED: getEventValue(EventDomains.RECOMMENDATION, 'resume_uploaded'),
  XP_EARNED: getEventValue(EventDomains.ACHIEVEMENT, 'xp_earned'),
  USER_LOGGED_IN: getEventValue(EventDomains.NOTIFICATION, 'user_logged_in'),
};
