import { generateAccessToken } from "src/auth";
import {
  AccessTokensPostDto,
  ComplexesPostDto,
  LotsPostDto,
  OrgsPostDto,
  TicketCommentsPostDto,
  TicketsPostDto,
  UsersPostDto
} from "src/dtos";
import { UnreachableError } from "src/errors";
import {
  Complex,
  Lot,
  Org,
  SystemRole,
  Ticket,
  TicketComment,
  User
} from "src/models";
import { SeedError } from "src/seeds/errors";
import {
  complexesPostDtoFactory,
  lotsPostDtoFactory,
  orgsPostDtoFactory,
  usersPostDtoFactory
} from "./factories";

export async function createNewOrg(
  dto: OrgsPostDto = orgsPostDtoFactory.build()
): Promise<Org> {
  const org = await Org.withProfileImageCreate(dto);
  return org;
}

export async function createNewComplex(
  dto?: ComplexesPostDto
): Promise<Complex> {
  if (!dto) {
    const org = await createNewOrg();
    dto = complexesPostDtoFactory.build({ orgId: org.id });
  }
  const complex = await Complex.create(dto);
  return complex;
}

export async function createNewLot(dto?: LotsPostDto): Promise<Lot> {
  if (!dto) {
    const complex = await createNewComplex();
    dto = lotsPostDtoFactory.build({ complexId: complex.id });
  }
  const lot = await Lot.create(dto);
  return lot;
}

export async function attachUsersToLot(
  lotId: number,
  roles: { [roleName: string]: Array<{ id: number }> }
): Promise<void> {
  const lot = await Lot.findByPkWithAssociations(lotId);
  if (!lot) {
    throw new UnreachableError();
  }
  const input = Lot.fromPutDtoToInput({ roles });
  await lot.updateWithAssociations(input);
}

export async function createNewTicket(
  issuerId: number,
  dto: TicketsPostDto
): Promise<Ticket> {
  const input = Ticket.fromPostDtoToInput(issuerId, dto);
  const ticket = await Ticket.createWithAssociations(input);
  return ticket;
}

export async function createNewTicketComment(
  commenterId: number,
  dto: TicketCommentsPostDto
): Promise<TicketComment> {
  const input = TicketComment.fromPostDtoToInput(commenterId, dto);
  const ticketComment = await TicketComment.createWithAssociations(input);
  return ticketComment;
}

export async function registerNewUser(
  dto: UsersPostDto = usersPostDtoFactory.build()
): Promise<{
  accessTokensPostDto: AccessTokensPostDto;
  accessToken: string;
  user: User;
}> {
  const cloned = { ...dto };
  if (
    !cloned.orgId &&
    (cloned.systemRole === "MANAGER" ||
      cloned.systemRole === "MANAGER_ADMIN" ||
      cloned.systemRole === "STANDARD_USER")
  ) {
    const org = await createNewOrg();
    cloned.orgId = org.id;
  }
  const input = User.fromPostDtoToInput(cloned);
  const { user, password } = await User.register(input);
  const accessToken = await generateAccessToken(user);
  if (!user.primaryEmail) {
    throw new UnreachableError();
  }
  return {
    accessTokensPostDto: {
      login: user.primaryEmail,
      password
    },
    accessToken,
    user
  };
}

/**
 * @returns Bearer Access Token
 */
export async function loginAsSuperADmin(): Promise<string> {
  const superAdmin = await User.findOne({
    include: [
      {
        model: SystemRole,
        where: { name: "SUPERADMIN" }
      }
    ]
  });
  if (!superAdmin) {
    throw new SeedError("users SUPERADMIN");
  }

  return await generateAccessToken(superAdmin);
}

/**
 * Register new MANAGER_ADMIN and return their access token.
 * @returns Bearer Access Token
 */
export async function loginAsNewManagerAdmin(): Promise<string> {
  const { accessToken } = await registerNewUser(
    usersPostDtoFactory.build({ systemRole: "MANAGER_ADMIN" })
  );
  return accessToken;
}

/**
 * Register new MANAGER and return their access token.
 * @returns Bearer Access Token
 */
export async function loginAsNewManager(): Promise<string> {
  const { accessToken } = await registerNewUser(
    usersPostDtoFactory.build({ systemRole: "MANAGER" })
  );
  return accessToken;
}

/**
 * Register new user and return their access token.
 * @returns Bearer Access Token
 */
export async function loginAsNew(): Promise<string> {
  const { accessToken } = await registerNewUser();
  return accessToken;
}
