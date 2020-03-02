import { Container, decorate, injectable } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import "reflect-metadata"; // required by inversify
import "src/controllers"; // to bind all providers
import env from "src/env";
import { mkS3, S3 } from "src/s3";
import { Controller } from "tsoa";

const iocContainer = new Container();

// registering base class of all controllers as injectable
decorate(injectable(), Controller);

iocContainer.bind<S3>(S3).toConstantValue(
  mkS3({
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    bucket: env.AWS_S3_BUCKET,
    region: env.AWS_S3_REGION,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY
  })
);

// "magic" builder that collects all controller providers
iocContainer.load(buildProviderModule());

export { iocContainer };

