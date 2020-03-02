import * as cors from "cors";
import { RequestHandler } from "express";
import env from "src/env";

const corsMiddleware: RequestHandler = cors({
  origin: env.FRONTEND_ORIGIN === "*" ? true : env.FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

export default corsMiddleware;
