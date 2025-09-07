import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import logger from "../utils/logger.js";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = (err as any).status || 500;
  const code = (err as any).code;
  const message = status >= 500 ? "Internal Server Error" : "Bad Request";
  logger.error({ err, status, code, path: req.path }, "request_error");
  res.status(status).json({ error: message });
};

export default errorHandler;
