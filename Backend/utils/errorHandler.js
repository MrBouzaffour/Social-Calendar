class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(message, 400);
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 404);
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message, 401);
    }
}

// Middleware to handle errors
const handleError = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        error: {
            name: err.name,
            message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optionally include stack trace in development
        },
    });

    console.error(`Error: ${err.name} - ${message}`);
};

module.exports = {
    CustomError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    handleError,
};
