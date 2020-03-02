import * as Boom from "@hapi/boom";
import { Op } from "sequelize";
import {
  comparePasswordWithHash,
  generateAccessToken,
} from "src/auth";
import { ResetPasswordPostDto, AccessTokensResponseDto } from "src/dtos";
import { ResetPasswordPostValidationBodyErrorDto } from "src/dtos/reset-password-post";
import { provideController } from "src/ioc";
import { User } from "src/models";
import {
  Body,
  Controller,
  Post,
  Response,
  Route,
  SuccessResponse
} from "tsoa";

// must not use default export due to how tsoa generates routes
@Route("reset-password")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(ResetPasswordController)
export class ResetPasswordController extends Controller {

  @Post()
  @SuccessResponse(201)
  @Response<ResetPasswordPostValidationBodyErrorDto>(
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
            "resetpasswordresetpassworddfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf"
        }
      }
    }
  )
  public async postAccessToken(
    @Body() dto: ResetPasswordPostDto
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

    const newPassword = dto.newPassword;
    const updatedUser = await user.updateWithPassword({ newPassword });

    const accessToken = await generateAccessToken(updatedUser);
    this.setStatus(201);
    return {
      accessToken
    };
  }
}
