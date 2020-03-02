import Attachment from "./attachment";
import Complex from "./complex";
import ComplexAttachment from "./complex-attachment";
import ComplexImage from "./complex-image";
import Image from "./image";
import Lot from "./lot";
import LotAttachment from "./lot-attachment";
import LotImage from "./lot-image";
import Org from "./org";
import Permission from "./permission";
import Role from "./role";
import RolePermission from "./role-permission";
import SystemPermission from "./system-permission";
import SystemRole from "./system-role";
import SystemRolePermission from "./system-role-permission";
import Ticket from "./ticket";
import TicketAttachment from "./ticket-attachment";
import TicketComment from "./ticket-comment";
import TicketLot from "./ticket-lot";
import TicketStatus from "./ticket-status";
import TicketTag from "./ticket-tag";
import TicketTicketTag from "./ticket-ticket-tag";
import User from "./user";
import UserLotRole from "./user-lot-role";

export type ModelName =
  | "TicketTicketTag"
  | "User"
  | "Permission"
  | "Role"
  | "RolePermission"
  | "SystemPermission"
  | "SystemRole"
  | "SystemRolePermission"
  | "Org"
  | "Complex"
  | "Lot"
  | "UserLotRole"
  | "TicketStatus"
  | "Ticket"
  | "Image"
  | "ComplexImage"
  | "LotImage"
  | "TicketTag"
  | "TicketComment"
  | "TicketLot"
  | "Attachment"
  | "TicketAttachment"
  | "ComplexAttachment"
  | "LotAttachment";

export {
  TicketTicketTag,
  User,
  Permission,
  Role,
  RolePermission,
  SystemPermission,
  SystemRole,
  SystemRolePermission,
  Org,
  Complex,
  Lot,
  UserLotRole,
  TicketStatus,
  Ticket,
  Image,
  ComplexImage,
  LotImage,
  TicketTag,
  TicketComment,
  TicketLot,
  Attachment,
  TicketAttachment,
  ComplexAttachment,
  LotAttachment
};
export default [
  TicketTicketTag,
  User,
  Permission,
  Role,
  RolePermission,
  SystemPermission,
  SystemRole,
  SystemRolePermission,
  Org,
  Complex,
  Lot,
  UserLotRole,
  TicketStatus,
  Ticket,
  Image,
  ComplexImage,
  LotImage,
  TicketTag,
  TicketComment,
  TicketLot,
  Attachment,
  TicketAttachment,
  ComplexAttachment,
  LotAttachment
];
