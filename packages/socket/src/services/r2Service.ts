import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const getClient = () =>
  new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

export const r2Service = {
  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  },

  async deleteFile(key: string): Promise<void> {
    const client = getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: key,
      }),
    );
  },
};
