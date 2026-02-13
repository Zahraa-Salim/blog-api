/**
 * Centralized error handling middleware.
 * Purpose: Convert thrown errors (AppError, ZodError, Mongoose errors) into consistent JSON responses.
 */

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};