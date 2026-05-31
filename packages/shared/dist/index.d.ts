import winston from 'winston';
import { EventEmitter } from 'events';
export declare const logger: winston.Logger;
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
declare class EventBus extends EventEmitter {
    constructor();
    /**
     * Publishes an event to all subscribers with retry capabilities.
     */
    publish(eventName: string, payload: any, retries?: number): Promise<void>;
    private executeListenerWithRetry;
}
export declare const AppEventBus: EventBus;
export declare const EventDomains: {
    INTERVIEW: string;
    NOTIFICATION: string;
    ACHIEVEMENT: string;
    ANALYTICS: string;
    ROADMAP: string;
    MENTOR: string;
    RECOMMENDATION: string;
};
export declare const EventActions: {
    CREATED: string;
    UPDATED: string;
    COMPLETED: string;
    FAILED: string;
};
export declare const getEventKey: (domain: string, action: string) => string;
export declare const getEventValue: (domain: string, action: string) => string;
export declare const AppEventNames: {
    INTERVIEW_COMPLETED: string;
    CODING_SUBMITTED: string;
    RESUME_UPLOADED: string;
    XP_EARNED: string;
    USER_LOGGED_IN: string;
};
export {};
//# sourceMappingURL=index.d.ts.map