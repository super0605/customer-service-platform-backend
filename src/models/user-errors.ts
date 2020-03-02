import { AppError } from "src/errors";

export class UserTooManySuperAdminsError extends AppError {
  name = "UserTooManySuperAdminsError";
}
