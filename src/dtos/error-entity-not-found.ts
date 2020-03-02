import { ModelName } from "src/models";
import ErrorDto from "./error";

export default interface ErrorEntityNotFoundDto extends ErrorDto {
  id: number | string;
  modelName: ModelName;
}
