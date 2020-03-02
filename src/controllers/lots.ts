import * as A from "fp-ts/lib/Array";
import { AuthNoPermissionError, mkSecurityManager } from "src/auth";
import {
  ErrorEntityNotFoundDto,
  LotsGetResponseDto,
  LotsGetSingleValidationQueryErrorDto,
  LotsGetValidationQueryErrorDto,
  LotsPostDto,
  LotsPostValidationBodyErrorDto,
  LotsPutDto,
  LotsPutValidationBodyErrorDto,
  LotsResponseDto
} from "src/dtos";
import { provideController } from "src/ioc";
import { AuthorizedRequest } from "src/middlewares/auth";
import { Complex, Lot } from "src/models";
import {
  ModelEntityNotFoundError,
  ModelForeignEntityNotFoundError
} from "src/models/errors";
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse
} from "tsoa";
import { pipe } from "fp-ts/lib/pipeable";
import { throwOnNull } from "src/utils";

// must not use default export due to how tsoa generates routes
@Route("lots")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(LotsController)
export class LotsController extends Controller {
  /**
   * @isInt orgId invalid integer number
   * @minimum orgId 1
   *
   * @isInt complexId invalid integer number
   * @minimum complexId 1
   */
  @Security("AuthorizationHeaderBearer")
  @Response<LotsGetValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation",
    {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      fields: {
        orgId: {
          rules: [
            {
              message: "invalid integer number",
              name: "isInteger"
            }
          ],
          value: "adsffsf"
        }
      }
    }
  )
  @Get()
  public async getLots(
    @Request() request: AuthorizedRequest,
    @Query() orgId?: number,
    @Query() complexId?: number,
    // TODO: optional inclusion of associations
    @Query() _withRolesAndUsers = false
  ): Promise<LotsGetResponseDto[]> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne(["READ_LOTS", "READ_LOTS_OF_RELATED_ORG"]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_LOTS");

    if (accessAll) {
      return pipe(
        await Lot.findAllWithAssociations({ orgId, complexId }),
        A.map(Lot.toGetDtoWithAssociations)
      );
    } else {
      if (relatedOrgId) {
        if (orgId && relatedOrgId !== orgId) {
          throw new AuthNoPermissionError("READ_LOTS");
        } else {
          return pipe(
            await Lot.findAllWithAssociations({
              orgId: relatedOrgId,
              complexId
            }),
            A.map(Lot.toGetDtoWithAssociations)
          );
        }
      } else {
        throw new AuthNoPermissionError("READ_LOTS");
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get("{id}")
  @Response<LotsGetSingleValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation"
    // TODO: add response get query example
  )
  @Response<ErrorEntityNotFoundDto>(404, "Requested lot is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Lot' is not found.",
    id: 123123,
    modelName: "Lot"
  })
  public async getLot(
    @Request() request: AuthorizedRequest,
    // TODO: optional inclusion of associations
    @Query() _withRolesAndUsers = false,
    id: number
  ): Promise<LotsGetResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne(["READ_LOTS", "READ_LOTS_OF_RELATED_ORG"]);

    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_LOTS");

    if (accessAll) {
      return pipe(
        await Lot.findByPkWithAssociations(id),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Lot", id);
        }),
        Lot.toGetDtoWithAssociations
      );
    } else {
      return pipe(
        await Lot.findByPkWithAssociations(id, { orgId: relatedOrgId }),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Lot", id);
        }),
        Lot.toGetDtoWithAssociations
      );
    }
  }

  @Security("AuthorizationHeaderBearer")
  @Post()
  @SuccessResponse(201)
  @Response<LotsPostValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        address1: {
          rules: [
            {
              name: "isRequired",
              message: "'address1' is required"
            }
          ]
        },
        postcode: {
          rules: [
            {
              name: "hasMaxLength",
              maxLength: 6,
              message: "maxLength 6"
            }
          ],
          value: "stsfring"
        },
        buildDate: {
          rules: [
            {
              name: "isDate",
              message: "invalid ISO 8601 date format, i.e. YYYY-MM-DD"
            }
          ],
          value: "2019-12-09-123123"
        },
        complexId: {
          rules: [
            {
              name: "foreignEntityExists",
              modelName: "Complex",
              message: "Associated entity '0' of type 'Complex' not found"
            },
            {
              name: "hasMin",
              min: 1,
              message: "min 1"
            }
          ],
          value: 0
        }
      }
    }
  )
  public async postLot(
    @Request() request: AuthorizedRequest,
    @Body() dto: LotsPostDto
  ): Promise<LotsResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "CREATE_LOT",
      "CREATE_LOT_OF_RELATED_ORG"
    ]);

    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("CREATE_LOT");

    const input = Lot.fromPostDtoToInput(dto);

    this.setStatus(201); // it will be rewritten in case of error
    if (accessAll) {
      return pipe(
        await Lot.createWithAssociatons(input),
        Lot.toDtoWithAssociations
      );
    } else {
      if (relatedOrgId) {
        const complex = await Complex.findByPk(dto.complexId);
        if (!complex) {
          throw new ModelForeignEntityNotFoundError(
            "Complex",
            dto.complexId,
            "complexId"
          );
        }
        const orgId = complex.orgId;

        if (orgId === relatedOrgId) {
          return pipe(
            await Lot.createWithAssociatons(input),
            Lot.toDtoWithAssociations
          );
        } else {
          throw new AuthNoPermissionError("CREATE_LOT");
        }
      } else {
        throw new AuthNoPermissionError("CREATE_LOT");
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Put("{id}")
  @SuccessResponse(204)
  @Response<LotsPutValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        roles: {
          value: "LOT_OWNER11",
          rules: [
            {
              name: "foreignEntityExists",
              modelName: "Role",
              message:
                "Associated entity 'LOT_OWNER11' of type 'Role' not found"
            }
          ]
        },
        postcode: {
          rules: [
            {
              name: "hasMaxLength",
              maxLength: 6,
              message: "maxLength 6"
            }
          ],
          value: "stsfring"
        },
        buildDate: {
          rules: [
            {
              name: "isDate",
              message: "invalid ISO 8601 date format, i.e. YYYY-MM-DD"
            }
          ],
          value: "2019-12-09-123123"
        }
      }
    }
  )
  @Response<ErrorEntityNotFoundDto>(404, "Requested lot is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Lot' is not found.",
    id: 123123,
    modelName: "Lot"
  })
  public async putLot(
    @Request() request: AuthorizedRequest,
    @Body() dto: LotsPutDto,
    id: number
  ): Promise<void> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "UPDATE_LOTS",
      "UPDATE_LOTS_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("UPDATE_LOTS");

    const input = Lot.fromPutDtoToInput(dto);

    if (accessAll) {
      const lot = pipe(
        await Lot.findByPkWithAssociations(id),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Lot", id);
        })
      );
      await lot.updateWithAssociations(input);
    } else {
      if (relatedOrgId) {
        const lot = pipe(
          await Lot.findByPkWithAssociations(id, { orgId: relatedOrgId }),
          throwOnNull(() => {
            throw new ModelEntityNotFoundError("Lot", id);
          })
        );
        await lot.updateWithAssociations(input);
      } else {
        throw new AuthNoPermissionError("UPDATE_LOTS");
      }
    }
  }
}
