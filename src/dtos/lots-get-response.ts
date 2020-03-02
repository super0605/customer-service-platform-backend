import LotsResponseDto from "./lots-response";
import UsersResponseDto from "./users-response";

export default interface LotsGetResponseDto extends LotsResponseDto {
  roles?: {
    [roleName: string]: Array<UsersResponseDto>;
  };
}
