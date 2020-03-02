import * as Boom from "@hapi/boom";
import { Op } from "sequelize";
import {
  comparePasswordWithHash,
  generateAccessToken,
  parseAccessToken
} from "src/auth";
import { AccessTokensPostDto, AccessTokensResponseDto } from "src/dtos";
import { AccessTokensPostValidationBodyErrorDto } from "src/dtos/access-tokens-post";
import { provideController } from "src/ioc";
import { User } from "src/models";
import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  Route,
  SuccessResponse
} from "tsoa";

// must not use default export due to how tsoa generates routes
@Route("access-tokens")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(AccessTokensController)
export class AccessTokensController extends Controller {
  /**
   * @format accessToken
   * @isString accessToken
   */
  @Get("{accessToken}")
  public async getAccessToken(
    accessToken: string
  ): Promise<AccessTokensResponseDto> {
    try {
      await parseAccessToken(accessToken);
    } catch (err) {
      throw Boom.badRequest(err);
    }
    return {
      accessToken
    };
  }

  @Post()
  @SuccessResponse(201)
  @Response<AccessTokensPostValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        login: {
          rules: [
            {
              name: "hasMaxLength",
              maxLength: 64,
              message: "maxLength 64"
            }
          ],
          value:
            "asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf"
        }
      }
    }
  )
  public async postAccessToken(
    @Body() dto: AccessTokensPostDto
  ): Promise<AccessTokensResponseDto> {
    const user = await User.scope("withPassword").findOne({
      where: {
        [Op.or]: [
          {
            primaryEmail: dto.login
          },
          {
            homePhone: dto.login
          },
          {
            mobilePhone: dto.login
          }
        ]
      }
    });
    const errMsg = "User/password mismatch.";
    if (!user) {
      throw Boom.unauthorized(errMsg);
    }
    const isCorrect = await comparePasswordWithHash(
      user.salt,
      user.passwordHash,
      dto.password
    );
    if (!isCorrect) {
      throw Boom.unauthorized(errMsg);
    }
    const accessToken = await generateAccessToken(user);
    this.setStatus(201);
    return {
      accessToken
    };
  }
}
