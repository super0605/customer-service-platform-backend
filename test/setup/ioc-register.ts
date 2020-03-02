import { Container, decorate, injectable } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import "reflect-metadata"; // required by inversify
import "src/controllers"; // to bind all providers
import { S3, UploadBody, UploadResult } from "src/s3";
import { Controller } from "tsoa";

const iocContainer = new Container();

// registering base class of all controllers as injectable
decorate(injectable(), Controller);

iocContainer.bind<S3>(S3).toConstantValue({
  // TODO: any way to remove raw and properly unit test the multer-s3?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: undefined as any,
  bucket: "some-bucket",
  getSignedUrl(key: string) {
    return "https://" + key;
  },
  async upload(key: string, _body: UploadBody): Promise<UploadResult> {
    return {
      Bucket: "some-bucket",
      ETag: "some-etag",
      Key: key,
      Location: "some-location"
    };
  }
});

// "magic" builder that collects all controller providers
iocContainer.load(buildProviderModule());

export { iocContainer };
