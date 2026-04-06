import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.R2_BUCKET_NAME!;

// Internal client for server-to-storage communication (e.g. fetching objects for sharp processing).
// In Docker dev this points to http://minio:9000; in production to the R2 endpoint.
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // Path-style required for MinIO; R2 also supports it.
  forcePathStyle: true,
});

// Separate client for generating presigned URLs the browser will use directly.
// In Docker dev R2_PRESIGN_URL is localhost:9000 (browser-reachable);
// in production it's the same as R2_ENDPOINT.
const presignClient = new S3Client({
  region: "auto",
  endpoint: process.env.R2_PRESIGN_URL ?? process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(presignClient, command, { expiresIn });
}

export async function headObject(key: string) {
  const command = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
  return s3.send(command);
}

export async function getObject(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return s3.send(command);
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3.send(command);
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(command);
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const command = new DeleteObjectsCommand({
    Bucket: BUCKET,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
      Quiet: true,
    },
  });
  await s3.send(command);
}
