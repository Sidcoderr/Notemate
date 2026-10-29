import { z } from "zod";

export const noteInputSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title must be at least 1 character long")
    .max(200, "Title cannot exceed 200 characters"),
  content: z
    .string({ required_error: "Content must be a string" })
    .max(20000, "Content cannot exceed 20,000 characters")
    .default(""),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format (must be a valid UUID)"),
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid parameter",
        details: result.error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    req.params = result.data;
    next();
  };
}

