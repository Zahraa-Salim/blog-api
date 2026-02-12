/**
 * Request validation middleware using Zod schemas.
 * Purpose: Validates req.body/req.params/req.query and rejects invalid requests with 400.
 */
import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  };
