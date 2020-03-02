import * as AWS from "aws-sdk";
import { Readable } from "stream";
import { injectable } from "./ioc";

export type UploadBody = Readable;

export type UploadResult = AWS.S3.ManagedUpload.SendData;

@injectable()
export abstract class S3 {
  constructor(public raw: AWS.S3, public bucket: string) {}

  abstract upload(key: string, body: UploadBody): Promise<UploadResult>;
  abstract getSignedUrl(key: string): string;
}

class S3Internal extends S3 {
  constructor(raw: AWS.S3, bucket: string) {
    super(raw, bucket);
  }

  async upload(key: string, body: UploadBody): Promise<UploadResult> {
    const res = await this.raw
      .upload({ Bucket: this.bucket, Key: key, Body: body })
      .promise();

    return res;
  }

  getSignedUrl(key: string): string {
    const signedUrlExpireSeconds = 60 * 5;

    return this.raw.getSignedUrl("getObject", {
      Bucket: this.bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });
  }
}

export interface S3Options {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export function mkS3({
  accessKeyId,
  secretAccessKey,
  region,
  bucket
}: S3Options): S3 {
  const credentials = new AWS.Credentials({
    accessKeyId,
    secretAccessKey
  });
  // TODO: logger
  const s3 = new AWS.S3({ credentials, region });

  return new S3Internal(s3, bucket);
}
