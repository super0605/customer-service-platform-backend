import { AppError } from "src/errors";
import { ModelName } from ".";

export class ModelEntityNotFoundError extends AppError {
  name = "ModelEntityNotFoundError";
  constructor(public modelName: ModelName, public id: string | number) {
    super();
  }
}

export class ModelForeignEntityNotFoundError<
  T
> extends ModelEntityNotFoundError {
  name = "ModelForeignEntityNotFoundError";
  constructor(
    modelName: ModelName,
    id: string | number,
    public field: keyof T
  ) {
    super(modelName, id);
  }
}
