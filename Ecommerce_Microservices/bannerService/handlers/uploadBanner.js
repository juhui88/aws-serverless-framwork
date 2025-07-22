// Importing required s2 modules form AWS SDK
// These are needed to interact with S3 and generate pre-signed Urls
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Creating an s3 client instance with the specified AWS region
const s3Client = new S3Client({
  region: process.env.REGION,
});

// Lambda function to generate a pre-signed URL for S3 file upload
// Url allows clients to securely upload a file to S3 bucket without exposting aws credentials
exports.getUploadUrl = async (event) => {
  try {
    //Extracting S3 bucket name from envireonment variables
    // The bucket where the file will be uploaded
    const bucketName = process.env.BUCKET_NAME;

    // Parsing the incommint event body to get fileName and fileType
    // FileName : name of the file to be uploaded
    // FileType : Mime type of the file
    const { fileName, fileType } = JSON.parse(event.body);

    // Validating that both fileName and fileType are provided
    // if either is missing, return a 400 bad request
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing fileName or fileType" }),
      };
    }

    // Creating an S3 PutObjectCommand with bucket, key(fileName), and content type
    // this defined the S3 object that will be created/udated by the file uploaded
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    // Generating a pre-signed url expires in 3600 seconds(1 hour)
    // this url allows the client to upload the file directley to s3
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // returning the generated pre-signed url in the response
    // client uses this url to perform the actual file upload
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadedUrl: signedUrl }),
    };
  } catch (error) {
    console.error("Error generating pre-signed url:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
