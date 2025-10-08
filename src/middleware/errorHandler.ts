import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.status ?? 500;
  const message = error.message ?? "Internal Server Error";
  // eslint-disable-next-line no-console
  console.error("[error]", message, error.stack);
  res.status(status).json({ error: message });
};
