import type { Request, RequestHandler } from "express";
import type { AnyObjectSchema } from "yup";
import { PayloadType } from "../util/enum/common.enum.js";

/**
 * Runs a Yup schema against req.body, req.query or req.params and replaces it
 * with the cast value (trimmed, defaulted, unknown keys stripped). A failure
 * reaches errorHandler as a ValidationError and becomes a 400.
 */
export function validateRequest({
  schema,
  type = PayloadType.BODY,
}: {
  schema: AnyObjectSchema;
  type?: PayloadType;
}): RequestHandler {
  return async (req, _res, next) => {
    const value = await schema.validate(req[type] ?? {}, { abortEarly: false, stripUnknown: true });

    if (type === PayloadType.QUERY) {
      // Express 5 exposes req.query as a getter, so shadow it with the cast value.
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else if (type === PayloadType.PARAMS) {
      req.params = value as Request["params"];
    } else {
      req.body = value;
    }
    next();
  };
}
