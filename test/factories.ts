import { each, Sync } from "factory.ts";
import * as faker from "faker";
import {
  ComplexesPostDto,
  ComplexesPutDto,
  LotsPostDto,
  LotsPutDto,
  OrgsPostDto,
  TicketsPostDto,
  TicketsPutDto,
  UsersPostDto,
  UsersPutDto,
  TicketCommentsPostDto,
  TicketCommentsPutDto
} from "src/dtos";
import { ClassificationType } from "src/models/classification-type";
import { OccupierType } from "src/models/occupier-type";
import { ProblemCategory } from "src/models/problem-category";
import { TicketType } from "src/models/ticket-type";
import { GetExplicitUndefinedType } from "src/models/type-magic";

/**
 * Helper function to ignore default factory generation parameters.
 */
const wp = <T>(fn: () => T): Sync.Generator<T> => each(() => fn());

const _repeat = <T>(num: number, fn: () => T): T[] => {
  const arr = [];
  for (let i = 0; i < num; ++i) {
    arr[i] = fn();
  }
  return arr;
};

const uniqueStr = (name: string, gen: () => string): Sync.Generator<string> => {
  const MAX_COUNT = 100;
  const cache: { [candidate: string]: true } = {};
  return wp(() => {
    for (let i = 0; i < MAX_COUNT; ++i) {
      const candidate = gen();
      if (cache[candidate] != null) continue;
      cache[candidate] = true;
      return candidate;
    }
    throw new Error(
      `MAX_COUNT=${MAX_COUNT} reached while trying to generate unique ${name}`
    );
  });
};

const repeatJoin = <T>(num: number, fn: () => T): Sync.Generator<string> =>
  each(() => _repeat(num, fn).join(""));

const numericWord = (length: number): Sync.Generator<string> =>
  repeatJoin(length, () => faker.random.number({ min: 0, max: 9 }));

const genPhoneNumber: Sync.Generator<string> = numericWord(16);
const genAddress: Sync.Generator<string> = wp(() =>
  faker.address.streetAddress(true)
);
const genAbn: Sync.Generator<string> = numericWord(11);
const genTfn: Sync.Generator<string> = numericWord(9);
const genSuburb: Sync.Generator<string> = wp(faker.lorem.slug);
const genPostCode: Sync.Generator<string> = numericWord(6);
const genOccupierType: Sync.Generator<OccupierType> = wp(() =>
  faker.random.arrayElement([
    OccupierType.OwnerOccupied,
    OccupierType.ManagedProperty
  ])
);
const genClassificationType: Sync.Generator<ClassificationType> = wp(() =>
  faker.random.arrayElement([
    ClassificationType.Residential,
    ClassificationType.Commercial,
    ClassificationType.Mixed
  ])
);
const genTicketType: Sync.Generator<TicketType> = wp(() =>
  faker.random.arrayElement([
    TicketType.CommunityNotice,
    TicketType.Problem,
    TicketType.Question
  ])
);
const genProblemCategory: Sync.Generator<ProblemCategory> = wp(() =>
  faker.random.arrayElement([
    ProblemCategory.CommunalAreas,
    ProblemCategory.Electrical,
    ProblemCategory.Plumbing,
    ProblemCategory.Structural
  ])
);
const genTicketStatus: Sync.Generator<string> = wp(() =>
  faker.random.arrayElement(["OPEN", "CLOSED"])
);
const genStrataPlan = numericWord(16);
const genProfileImage: Sync.Generator<string> = uniqueStr(
  "genProfileImage",
  () =>
    `${faker.internet.url()}/${_repeat(16, () =>
      faker.random.number({ min: 0, max: 9 })
    ).join("")}.jpg`
);
// TODO: replace Sync.Generators with something composable
const genImages: Sync.Generator<string[]> = wp(() =>
  _repeat(
    faker.random.number({ min: 0, max: 12 }),
    () =>
      `${faker.internet.url()}/${_repeat(16, () =>
        faker.random.number({ min: 0, max: 9 })
      ).join("")}.jpg`
  )
);
const possibleTags = _repeat(50, faker.lorem.word).filter(t => t.length <= 45);
const genTags: Sync.Generator<string[]> = wp(() =>
  _repeat(faker.random.number({ min: 0, max: 12 }), () =>
    faker.random.arrayElement(possibleTags)
  )
);
const genAttachments: Sync.Generator<string[]> = wp(() =>
  _repeat(faker.random.number({ min: 0, max: 5 }), faker.image.imageUrl)
);

export const usersPostDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<UsersPostDto>
>({
  dateOfBirth: wp(() => faker.date.past()),
  firstName: wp(faker.name.firstName),
  primaryEmail: wp(faker.internet.email),
  surName: wp(faker.name.lastName),
  title: wp(faker.name.title),
  systemRole: wp(() => faker.random.arrayElement(["MANAGER", "MANAGER_ADMIN"])),
  abn: genAbn,
  company: wp(faker.company.companyName),
  fax: genPhoneNumber,
  homePhone: genPhoneNumber,
  mobilePhone: genPhoneNumber,
  profileImage: genProfileImage,
  secondaryEmail: wp(faker.internet.email),
  orgId: undefined
});

export const usersPutDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<UsersPutDto>
>({
  dateOfBirth: wp(() => faker.date.past()),
  firstName: wp(faker.name.firstName),
  primaryEmail: wp(faker.internet.email),
  surName: wp(faker.name.lastName),
  title: wp(faker.name.title),
  systemRole: wp(() => faker.random.arrayElement(["MANAGER", "MANAGER_ADMIN"])),
  abn: genAbn,
  company: wp(faker.company.companyName),
  fax: genPhoneNumber,
  homePhone: genPhoneNumber,
  mobilePhone: genPhoneNumber,
  profileImage: genProfileImage,
  secondaryEmail: wp(faker.internet.email)
});

export const orgsPostDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<OrgsPostDto>
>({
  abn: genAbn,
  address1: genAddress,
  postcode: genPostCode,
  state: wp(faker.address.stateAbbr),
  suburb: genSuburb,
  tradingName: wp(faker.company.companyName),
  profileImage: genProfileImage,
  address2: genAddress,
  companyName: wp(faker.company.companyName)
});

export const complexesPostDtoFactory = Sync.makeFactoryWithRequired<
  GetExplicitUndefinedType<ComplexesPostDto>,
  "orgId"
>({
  strataPlan: genStrataPlan,
  name: wp(faker.name.firstName),
  spNum: wp(faker.random.word),
  address1: genAddress,
  address2: genAddress,
  suburb: genSuburb,
  state: wp(faker.address.stateAbbr),
  postcode: genPostCode,
  type: wp(faker.random.word),
  numLots: wp(faker.random.number),
  establishedDate: wp(faker.date.past),
  abn: genAbn,
  tfn: genTfn,
  classification: genClassificationType,
  storeys: wp(faker.random.number),
  characteristics: wp(faker.random.word),
  totalFloorArea: wp(faker.random.number),
  totalLandArea: wp(faker.random.number),
  buildDate: wp(faker.date.past),
  builder: wp(faker.name.firstName),
  images: genImages,
  attachments: genAttachments
});

export const complexesPutDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<ComplexesPutDto>
>({
  strataPlan: genStrataPlan,
  name: wp(faker.name.firstName),
  spNum: wp(faker.random.word),
  address1: genAddress,
  address2: genAddress,
  suburb: genSuburb,
  state: wp(faker.address.stateAbbr),
  postcode: genPostCode,
  type: wp(faker.random.word),
  numLots: wp(faker.random.number),
  establishedDate: wp(faker.date.past),
  abn: genAbn,
  tfn: genTfn,
  classification: genClassificationType,
  storeys: wp(faker.random.number),
  characteristics: wp(faker.random.word),
  totalFloorArea: wp(faker.random.number),
  totalLandArea: wp(faker.random.number),
  buildDate: wp(faker.date.past),
  builder: wp(faker.name.firstName),
  isActive: wp(faker.random.boolean),
  images: genImages,
  attachments: genAttachments
});

export const lotsPostDtoFactory = Sync.makeFactoryWithRequired<
  GetExplicitUndefinedType<LotsPostDto>,
  "complexId"
>({
  occupier: genOccupierType,
  classification: genClassificationType,
  storeys: wp(faker.random.number),
  characteristics: wp(faker.random.word),
  floorArea: wp(faker.random.number),
  landArea: wp(faker.random.number),
  buildDate: wp(faker.date.past),
  address1: genAddress,
  address2: genAddress,
  suburb: genSuburb,
  state: wp(faker.address.stateAbbr),
  postcode: genPostCode,
  gpsLatitude: wp(faker.address.latitude),
  gpsLongitude: wp(faker.address.longitude),
  images: genImages,
  profileImage: genProfileImage,
  attachments: genAttachments
});

export const lotsPutDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<LotsPutDto>
>({
  occupier: genOccupierType,
  classification: genClassificationType,
  storeys: wp(faker.random.number),
  characteristics: wp(faker.random.word),
  floorArea: wp(faker.random.number),
  landArea: wp(faker.random.number),
  buildDate: wp(faker.date.past),
  address1: genAddress,
  address2: genAddress,
  suburb: genSuburb,
  state: wp(faker.address.stateAbbr),
  postcode: genPostCode,
  gpsLatitude: wp(faker.address.latitude),
  gpsLongitude: wp(faker.address.longitude),
  isActive: wp(faker.random.boolean),
  roles: undefined,
  images: genImages,
  profileImage: genProfileImage,
  attachments: genAttachments
});

export const ticketsPostDtoFactory = Sync.makeFactoryWithRequired<
  GetExplicitUndefinedType<TicketsPostDto>,
  "primaryLotId" | "lots"
>({
  ticketType: genTicketType,
  description: wp(faker.lorem.sentence),
  problemCategory: genProblemCategory,
  executiveId: undefined,
  profileImage: genProfileImage,
  title: wp(faker.name.jobDescriptor),
  affectsMultipleProperties: wp(faker.random.boolean),
  isUrgent: wp(faker.random.boolean),
  tags: genTags,
  attachments: genAttachments
});

export const ticketsPutDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<TicketsPutDto>
>({
  ticketType: genTicketType,
  description: wp(faker.lorem.sentence),
  problemCategory: genProblemCategory,
  ticketStatus: genTicketStatus,
  affectsMultipleProperties: wp(faker.random.boolean),
  executiveId: undefined,
  isUrgent: wp(faker.random.boolean),
  profileImage: genProfileImage,
  title: wp(faker.name.jobDescriptor),
  tags: genTags,
  attachments: genAttachments
});

export const ticketCommentsPostDtoFactory = Sync.makeFactoryWithRequired<
  GetExplicitUndefinedType<TicketCommentsPostDto>,
  "ticketId"
>({
  comment: wp(faker.lorem.paragraph)
});

export const ticketCommentsPutDtoFactory = Sync.makeFactory<
  GetExplicitUndefinedType<TicketCommentsPutDto>
>({
  comment: wp(faker.lorem.paragraph)
});
