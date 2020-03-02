import { mkSecurityManager } from "src/auth";
import {
  ErrorEntityNotFoundDto,
  OrgsGetValidationQueryErrorDto,
  OrgsPostDto,
  OrgsPostValidationBodyErrorDto,
  OrgsPutDto,
  OrgsPutValidationBodyErrorDto,
  OrgsResponseDto
} from "src/dtos";
import { provideController } from "src/ioc";
import { AuthorizedRequest } from "src/middlewares/auth";
import { Org } from "src/models";
import { ModelEntityNotFoundError } from "src/models/errors";
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

// must not use default export due to how tsoa generates routes
@Route("orgs")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(OrgsController)
export class OrgsController extends Controller {
  @Security("AuthorizationHeaderBearer", ["READ_ORGS"])
  @Get()
  @Response<OrgsGetValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation",
    {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      fields: {
        withProfileImage: {
          rules: [
            {
              message: "invalid boolean",
              name: "isBoolean"
            }
          ],
          value: "asdf"
        }
      }
    }
  )
  public async getOrgs(
    @Query() withProfileImage = false
  ): Promise<OrgsResponseDto[]> {
    if (withProfileImage) {
      return (await Org.withProfileImageFindAll()).map(o => Org.toDto(o));
    } else {
      return (await Org.findAll()).map(o => Org.toDto(o));
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer", [])
  @Get("{id}")
  @Response<ErrorEntityNotFoundDto>(404, "Requested org is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Org' is not found.",
    id: 123123,
    modelName: "Org"
  })
  @Response<OrgsGetValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation",
    {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      fields: {
        withProfileImage: {
          rules: [
            {
              message: "invalid boolean",
              name: "isBoolean"
            }
          ],
          value: "asdf"
        }
      }
    }
  )
  public async getOrg(
    @Request() request: AuthorizedRequest,
    @Query() withProfileImage = false,
    id: number
  ): Promise<OrgsResponseDto> {
    if (id !== request.user.orgId) {
      const securityManager = mkSecurityManager(request);
      securityManager.ensurePermission("READ_ORGS");
    }
    if (withProfileImage) {
      const org = await Org.withProfileImageFindByPk(id);
      if (!org) {
        throw new ModelEntityNotFoundError("Org", id);
      }
      return Org.toDto(org);
    } else {
      const org = await Org.findByPk(id);
      if (!org) {
        throw new ModelEntityNotFoundError("Org", id);
      }
      return Org.toDto(org);
    }
  }

  @Security("AuthorizationHeaderBearer", ["CREATE_ORG"])
  @Post()
  @SuccessResponse(201)
  @Response<OrgsPostValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        postcode: {
          rules: [
            {
              name: "hasMaxLength",
              maxLength: 6,
              message: "maxLength 6"
            }
          ],
          value: "sdfasfasdfsadfasdf"
        },
        abn: {
          rules: [
            {
              name: "hasMinLength",
              minLength: 11,
              message: "minLength 11"
            }
          ],
          value: "123"
        }
      }
    }
  )
  public async postOrg(@Body() dto: OrgsPostDto): Promise<OrgsResponseDto> {
    const org = await Org.withProfileImageCreate(dto);

    this.setStatus(201);
    return Org.toDto(org);
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Put("{id}")
  @SuccessResponse(204)
  @Response<OrgsPutValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        postcode: {
          rules: [
            {
              name: "hasMaxLength",
              maxLength: 6,
              message: "maxLength 6"
            }
          ],
          value: "sdfasfasdfsadfasdf"
        },
        abn: {
          rules: [
            {
              name: "hasMinLength",
              minLength: 11,
              message: "minLength 11"
            }
          ],
          value: "123"
        }
      }
    }
  )
  @Response<ErrorEntityNotFoundDto>(404, "Requested org is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Org' is not found.",
    id: 123123,
    modelName: "Org"
  })
  public async putOrg(
    @Request() request: AuthorizedRequest,
    @Body() dto: OrgsPutDto,
    id: number
  ): Promise<void> {
    const selfUpdate = request.user.orgId === id;

    const securityManager = mkSecurityManager(request);
    securityManager.ensurePermission(selfUpdate ? "UPDATE_ORG" : "UPDATE_ORGS");

    await Org.withProfileImageUpdateByPk(id, dto);
  }
}
