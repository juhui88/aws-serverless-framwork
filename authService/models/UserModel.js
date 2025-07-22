const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const TABLE_NAME = "Users"; // DynamoDB table name

// Initialize DynamoDB client with specified AWS Region
const dynamoClient = new DynamoDBClient({
  region: process.env.REGION, // AWS regison where the Dynamodb table is located
});

// User Model class to represent a user and handle database operations
class UserModel {
  constructor(email, fullName) {
    this.userId = uuidv4(); // Generate a unique user Id
    this.email = email; // store the email of the user
    this.fullName = fullName; // store the fullName of the user
    this.state = ""; //default empty string for state
    this.city = "";
    this.locality = "";
    this.createdAt = new Date().toISOString(); // store user creation timestamp
  }

  //save user data to DynamoDB
  async save() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: { S: this.userId },
        email: { S: this.email },
        fullName: { S: this.fullName },
        state: { S: this.state },
        city: { S: this.city },
        locality: { S: this.locality },
        createdAt: { S: this.createdAt },
      },
    };

    try {
      await dynamoClient.send(new PutItemCommand(params));
      return this.userId;
    } catch (error) {
      console.error("Error saving user to DynamoDB:", error);
      throw error;
    }
  }
}

module.exports = UserModel;
