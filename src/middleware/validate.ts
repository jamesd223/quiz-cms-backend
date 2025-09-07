import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

type Schemas = {
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
  body?: ZodSchema<any>;
};

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      (err as any).status = 400;
      next(err);
    }
  };
}

export default validate;
