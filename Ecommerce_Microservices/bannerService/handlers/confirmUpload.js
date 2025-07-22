//Import necessary AWS SDK modules for dynamoDB
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

//Initialize Dynamo Client with the specified AWS region
const dynamoDbClient = new DynamoDBClient({
  region: process.env.REGION,
});

//lambda function to confirm file uplaod and store file metadata in dynamoDb
exports.confirmUpload = async (event) => {
  try {
    //Retrieve environment variables for table and bucket names
    const tableName = process.env.DYNAMO_TABLE;
    const bucketName = process.env.BUCKET_NAME;

    //Extract file details from S3 event notification
    const record = event.Records[0]; //Get first record
    //Extract the file Name  from s3 event
    const fileName = record.s3.object.key;
    //Construct the public Url  for  the uploaded  file
    const imageUrl = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${fileName}`;
    //                https://banner-image-juhui-dev.s3.us-east-1.amazonaws.com/%EC%9B%83%EB%8A%94%EA%B3%A0%EC%96%91%EB%B0%9D%EC%9D%80%EB%B2%84%EC%A0%84.png
    //Prepare the file metedata to best in DynamoDB

    const putItemCommand = new PutItemCommand({
      TableName: tableName,
      Item: {
        fileName: { S: fileName },
        imageUrl: { S: imageUrl },
        uploadedAt: { S: new Date().toISOString() },
      },
    });

    //Save file metedata to DynamoDB for  tracting and retrieval
    await dynamoDbClient.send(putItemCommand);

    //return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded & confirmed" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
