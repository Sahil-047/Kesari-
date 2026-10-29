import type { Request, RequestHandler } from "express";
import type { z } from "zod";

type Shapes = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
};

/**
 * Parses body, query and params against Zod schemas and replaces them with
 * the parsed (coerced, stripped) values. A failure becomes a 400 via the error handler.
 */
export function validate(shapes: Shapes): RequestHandler {
  return (req, _res, next) => {
    if (shapes.params) req.params = shapes.params.parse(req.params) as Request["params"];
    if (shapes.body) req.body = shapes.body.parse(req.body);
    if (shapes.query) {
      // Express 5 exposes req.query as a getter, so shadow it with the parsed value.
      Object.defineProperty(req, "query", {
        value: shapes.query.parse(req.query),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    next();
  };
}
