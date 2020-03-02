import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { AuthNoPermissionError, mkSecurityManager } from "src/auth";
import {
  ComplexesGetValidationQueryErrorDto,
  ComplexesPostDto,
  ComplexesPostValidationBodyErrorDto,
  ComplexesPutDto,
  ComplexesPutValidationBodyErrorDto,
  ComplexesResponseDto,
  ErrorEntityNotFoundDto
} from "src/dtos";
import { provideController } from "src/ioc";
import { AuthorizedRequest } from "src/middlewares/auth";
import { Complex } from "src/models";
import { ModelEntityNotFoundError } from "src/models/errors";
import { throwOnNull } from "src/utils";
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
@Route("complexes")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(ComplexesController)
export class ComplexesController extends Controller {
  /**
   * @isInt orgId invalid integer number
   * @minimum orgId 1
   */
  @Security("AuthorizationHeaderBearer")
  @Response<ComplexesGetValidationQueryErrorDto>(
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
          value: "asdf"
        }
      }
    }
  )
  @Get()
  public async getComplexes(
    @Request() request: AuthorizedRequest,
    @Query() orgId?: number
  ): Promise<ComplexesResponseDto[]> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_COMPLEXES",
      "READ_COMPLEXES_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_COMPLEXES");

    if (accessAll) {
      return pipe(
        await Complex.findAllWithAssociations({ orgId }),
        A.map(Complex.toDtoWithAssociations)
      );
    } else {
      if (relatedOrgId) {
        if (orgId && relatedOrgId !== orgId) {
          throw new AuthNoPermissionError("READ_COMPLEXES");
        } else {
          return pipe(
            await Complex.findAllWithAssociations({ orgId: relatedOrgId }),
            A.map(Complex.toDtoWithAssociations)
          );
        }
      } else {
        throw new AuthNoPermissionError("READ_COMPLEXES");
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get("{id}")
  @Response<ErrorEntityNotFoundDto>(404, "Requested complex is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Complex' is not found.",
    id: 123123,
    modelName: "Complex"
  })
  public async getComplex(
    @Request() request: AuthorizedRequest,
    id: number
  ): Promise<ComplexesResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_COMPLEXES",
      "READ_COMPLEXES_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_COMPLEXES");

    if (accessAll) {
      return pipe(
        await Complex.findByPkWithAssociations(id),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Complex", id);
        }),
        Complex.toDtoWithAssociations
      );
    } else {
      return pipe(
        await Complex.findByPkWithAssociations(id, { orgId: relatedOrgId }),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Complex", id);
        }),
        Complex.toDtoWithAssociations
      );
    }
  }

  @Security("AuthorizationHeaderBearer")
  @Post()
  @SuccessResponse(201)
  @Response<ComplexesPostValidationBodyErrorDto>(
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
              name: "hasMinLength",
              minLength: 6,
              message: "minLength 6"
            }
          ],
          value: "ffff"
        },
        type: {
          rules: [
            {
              message: "invalid string value",
              name: "isString"
            }
          ],
          value: 123
        },
        numLots: {
          rules: [
            {
              message: "invalid integer number",
              name: "isInteger"
            }
          ],
          value: "asdf"
        },
        orgId: {
          rules: [
            {
              name: "hasMin",
              min: 1,
              message: "min 1"
            }
          ],
          value: -123
        }
      }
    }
  )
  public async postComplex(
    @Request() request: AuthorizedRequest,
    @Body() dto: ComplexesPostDto
  ): Promise<ComplexesResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "CREATE_COMPLEX",
      "CREATE_COMPLEX_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("CREATE_COMPLEX");

    const input = Complex.fromPostDtoToInput(dto);

    this.setStatus(201); // it will be rewritten in case of error
    if (accessAll) {
      return pipe(
        await Complex.createWithAssociations(input),
        Complex.toDtoWithAssociations
      );
    } else {
      if (relatedOrgId) {
        if (dto.orgId === relatedOrgId) {
          return pipe(
            await Complex.createWithAssociations(input),
            Complex.toDtoWithAssociations
          );
        } else {
          throw new AuthNoPermissionError("CREATE_COMPLEX");
        }
      } else {
        throw new AuthNoPermissionError("CREATE_COMPLEX");
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
  @Response<ComplexesPutValidationBodyErrorDto>(
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
              name: "hasMinLength",
              minLength: 6,
              message: "minLength 6"
            }
          ],
          value: "ffff"
        },
        type: {
          rules: [
            {
              message: "invalid string value",
              name: "isString"
            }
          ],
          value: 123
        },
        numLots: {
          rules: [
            {
              message: "invalid integer number",
              name: "isInteger"
            }
          ],
          value: "asdf"
        },
        establishedDate: {
          rules: [
            {
              name: "isDate",
              message: "invalid ISO 8601 date format, i.e. YYYY-MM-DD"
            }
          ],
          value: "asdf"
        },
        buildDate: {
          rules: [
            {
              name: "isDate",
              message: "invalid ISO 8601 date format, i.e. YYYY-MM-DD"
            }
          ],
          value: 123
        },
        isActive: {
          rules: [
            {
              name: "isBoolean",
              message: "invalid boolean value"
            }
          ],
          value: "asdfasdf"
        }
      }
    }
  )
  @Response<ErrorEntityNotFoundDto>(404, "Requested complex is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Complex' is not found.",
    id: 123123,
    modelName: "Complex"
  })
  public async putComplex(
    @Request() request: AuthorizedRequest,
    @Body() dto: ComplexesPutDto,
    id: number
  ): Promise<void> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "UPDATE_COMPLEXES",
      "UPDATE_COMPLEXES_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("UPDATE_COMPLEXES");

    const input = Complex.fromPutDtoToInput(dto);

    if (accessAll) {
      const complex = pipe(
        await Complex.findByPkWithAssociations(id),
        throwOnNull(() => {
          throw new ModelEntityNotFoundError("Complex", id);
        })
      );
      await complex.updateWithAssociations(input);
    } else {
      if (relatedOrgId) {
        const complex = pipe(
          await Complex.findByPkWithAssociations(id, { orgId: relatedOrgId }),
          throwOnNull(() => {
            throw new ModelEntityNotFoundError("Complex", id);
          })
        );
        await complex.updateWithAssociations(input);
      } else {
        throw new AuthNoPermissionError("UPDATE_COMPLEXES");
      }
    }
  }
}
