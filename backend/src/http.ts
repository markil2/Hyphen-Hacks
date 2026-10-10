import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const ok = (res: Response, data: unknown, message = "Operation completed successfully", status = 200) =>
  res.status(status).json({ success: true, data, message });

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    req.query = parsed.query ?? req.query;
    next();
  } catch (error) {
    next(error);
  }
};

export const notFound = (_req: Request, _res: Response, next: NextFunction) =>
  next(new AppError(404, "NOT_FOUND", "Endpoint not found"));

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request data", details: error.flatten() },
    });
  }
  if (error instanceof AppError) {
    return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  if (process.env.NODE_ENV !== "test") console.error("Unhandled backend error", error);
  return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } });
};
