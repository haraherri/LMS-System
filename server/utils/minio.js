import { Client } from "minio";
import dotenv from "dotenv";
dotenv.config();

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === "true" || false,
  accessKey: process.env.MINIO_ACCESS_KEY || "miniorootuser",
  secretKey: process.env.MINIO_SECRET_KEY || "miniorootpassword",
});

const bucketName = process.env.MINIO_BUCKET_NAME || "lmsvideos"; // Bucket name default to lmsvideos

// Ensure bucket exists
const ensureBucket = async (bucket = bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, "us-east-1"); // region can be changed
      console.log(`Bucket created successfully: ${bucket}`);
      // Set policy to public
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    }
  } catch (error) {
    console.error("Error ensuring bucket:", error);
    throw error;
  }
};

// Upload video to MinIO
export const uploadVideoToMinio = async (
  filePath,
  fileName,
  bucket = bucketName
) => {
  try {
    await ensureBucket(bucket);
    const metaData = {
      "Content-Type": "video/mp4", // Or any other content type
    };
    const etag = await minioClient.fPutObject(
      bucket,
      fileName,
      filePath,
      metaData
    );
    const url = await minioClient.presignedGetObject(
      bucket,
      fileName,
      24 * 60 * 60
    ); // URL Temporarily valid for 1 day
    console.log("File uploaded successfully:", etag);
    return { etag: etag.etag, url };
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

// Delete video from MinIO
export const deleteVideoFromMinio = async (fileName, bucket = bucketName) => {
  try {
    await minioClient.removeObject(bucket, fileName);
    console.log("Video removed successfully:", fileName);
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
};

export default minioClient;
