const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: process.env.REGION });

exports.getAllCategories = async () => {
  try {
    const tableName = process.env.DYNAMO_TABLE;

    const scanCommand = new ScanCommand({
      TableName: tableName,
    });

    const { Items } = await dynamoDbClient.send(scanCommand);

    if (!Items || Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No categories found" }),
      };
    }

    const categories = Items.map((item) => ({
      fileName: item.fileName.S,
      imageUrl: item.imageUrl.S,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ categories }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
