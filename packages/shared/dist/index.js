"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEventNames = exports.getEventValue = exports.getEventKey = exports.EventActions = exports.EventDomains = exports.AppEventBus = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const events_1 = require("events");
// --- WINSTON LOGGER CONFIGURATION ---
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
    ],
});
// --- CUSTOM ERROR DEFINITIONS ---
class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden operation') {
        super(403, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
// --- EVENT BUS WITH RETRY & DLQ ---
class EventBus extends events_1.EventEmitter {
    constructor() {
        super();
        // Increase maximum listener count to prevent warnings
        this.setMaxListeners(50);
    }
    /**
     * Publishes an event to all subscribers with retry capabilities.
     */
    async publish(eventName, payload, retries = 3) {
        exports.logger.info(`[EventBus] Publishing event: ${eventName}`, { payload });
        const listeners = this.listeners(eventName);
        for (const listener of listeners) {
            this.executeListenerWithRetry(listener, eventName, payload, retries);
        }
    }
    async executeListenerWithRetry(listener, eventName, payload, retriesLeft) {
        try {
            await listener(payload);
        }
        catch (error) {
            exports.logger.error(`[EventBus] Error executing listener for event ${eventName}. Retries remaining: ${retriesLeft}`, { error: error.message });
            if (retriesLeft > 0) {
                // Linear backoff logic
                const backoffMs = (4 - retriesLeft) * 1000;
                setTimeout(() => {
                    this.executeListenerWithRetry(listener, eventName, payload, retriesLeft - 1);
                }, backoffMs);
            }
            else {
                exports.logger.error(`[EventBus] Dead Letter Queue (DLQ) alert for event ${eventName}. Execution exhausted.`, { payload, error: error.message });
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
exports.AppEventBus = new EventBus();
exports.EventDomains = {
    INTERVIEW: 'interview',
    NOTIFICATION: 'notification',
    ACHIEVEMENT: 'achievement',
    ANALYTICS: 'analytics',
    ROADMAP: 'roadmap',
    MENTOR: 'mentor',
    RECOMMENDATION: 'recommendation',
};
exports.EventActions = {
    CREATED: 'created',
    UPDATED: 'updated',
    COMPLETED: 'completed',
    FAILED: 'failed',
};
const getEventKey = (domain, action) => `${domain}:${action}`;
exports.getEventKey = getEventKey;
const getEventValue = (domain, action) => `${domain}:${action}`;
exports.getEventValue = getEventValue;
exports.AppEventNames = {
    INTERVIEW_COMPLETED: (0, exports.getEventValue)(exports.EventDomains.INTERVIEW, exports.EventActions.COMPLETED),
    CODING_SUBMITTED: (0, exports.getEventValue)(exports.EventDomains.ANALYTICS, 'coding_submitted'),
    RESUME_UPLOADED: (0, exports.getEventValue)(exports.EventDomains.RECOMMENDATION, 'resume_uploaded'),
    XP_EARNED: (0, exports.getEventValue)(exports.EventDomains.ACHIEVEMENT, 'xp_earned'),
    USER_LOGGED_IN: (0, exports.getEventValue)(exports.EventDomains.NOTIFICATION, 'user_logged_in'),
};
//# sourceMappingURL=index.js.map