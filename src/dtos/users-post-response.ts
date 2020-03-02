import UsersResponseDto from "./users-response";

export default interface UsersPostResponseDto extends UsersResponseDto {
  password: string;
}
