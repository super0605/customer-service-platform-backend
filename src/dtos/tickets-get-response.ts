import LotsResponseDto from "./lots-response";
import TicketsResponseDto from "./tickets-response";

export default interface TicketsGetResponseDto extends TicketsResponseDto {
  lots?: Array<LotsResponseDto>;
}
