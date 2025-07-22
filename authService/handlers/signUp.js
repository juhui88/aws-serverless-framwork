const UserModel = require("../models/UserModel");

// Import the required AWS Cognito SDK
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// Initialize Cognito client with specific region

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION, // Specify the region of the Cognito user pool
});

// Define Cognito App Client ID for user pool authentication
const CLIENT_ID = process.env.CLIENT_ID;

// Exported sign-up function to handle new user registration
exports.signUp = async (event) => {
  // Parse the incoming requiest body to extract user data
  const { email, password, fullName } = JSON.parse(event.body);

  const username = fullName.replace(/\s+/g, "");

  // Configure parameters for Cognito SignupCommand
  const params = {
    ClientId: CLIENT_ID, // Cognito App Client ID
    Username: username, // Internal unique ID (not email format)
    Password: password, // User's password
    UserAttributes: [
      // Additional user attributes for Cognito
      {
        Name: "email",
        Value: email,
      }, // Email attribute
      {
        Name: "name",
        Value: username,
      }, // Full name attribute
    ],
  };

  try {
    // Create the user in Cognito user pool
    const command = new SignUpCommand(params);

    //Execute the sign-up request
    await client.send(command);

    //save user in DynamoDB after Cognito sign-up succeeds
    const newUser = new UserModel(email, username);
    await newUser.save();

    // Return success response to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Account created please verify your email",
        username: fullName, // Save this username for confirmation step
        email: email, // Email for reference
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "sign-up failed",
        error: error.message,
      }),
    };
  }
};
