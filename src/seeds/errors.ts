import { AppError } from "src/errors";
import { SeedName } from "./seeds";

export class SeedError extends AppError {
  name = "SeedError";
  constructor(public seed: SeedName) {
    super(seed);
  }
}
