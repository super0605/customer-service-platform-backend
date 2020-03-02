import * as express from "express";
import { inject } from "inversify";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import { UploadsResponseDto } from "src/dtos";
import { provideController } from "src/ioc";
import logger from "src/logger";
import { AuthorizedRequest } from "src/middlewares/auth";
import { S3 } from "src/s3";
import { generateUuid, promisifyRequestMiddleware } from "src/utils";
import { AppValidationBodyError } from "src/validation";
import {
  Controller,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse
} from "tsoa";

// must not use default export due to how tsoa generates routes
@Route("uploads")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(UploadsController)
export class UploadsController extends Controller {
  private applyMulter: (request: express.Request) => Promise<void>;

  constructor(@inject(S3) private s3: S3) {
    super();
    logger.debug("s3", this.s3);

    const storage = multerS3({
      s3: this.s3.raw,
      bucket: this.s3.bucket,
      // acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function(_req, _file, cb) {
        cb(null, generateUuid());
      }
    });

    const multerSingle = multer({
      storage,
      limits: {
        fileSize: 20 * 1024 * 1024 // 20 mb
      }
    }).single("file");

    this.applyMulter = promisifyRequestMiddleware(multerSingle);
  }

  @Security("AuthorizationHeaderBearer", ["CREATE_UPLOAD"])
  @Post()
  @SuccessResponse(201)
  // TODO: example of error responses
  public async postUpload(
    @Request() request: AuthorizedRequest
  ): Promise<UploadsResponseDto> {
    await this.applyMulter(request);

    if (!request.file) {
      throw new AppValidationBodyError({
        file: {
          value: request.file,
          rules: [
            {
              name: "isRequired",
              message: `'file' is required`
            }
          ]
        }
      });
    }

    logger.debug("request.file", request.file);

    this.setStatus(201);
    return {
      url: request.file.location
    };
  }
}
