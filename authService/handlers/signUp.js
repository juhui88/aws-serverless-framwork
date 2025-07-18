// Import the required AWS Cognito SDK
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// Initialize Cognito client with specific region

const client = new CognitoIdentityProviderClient({
  region: "ap-southeast-2", // Specify the region of the Cognito user pool
});

// Define Cognito App Client ID for user pool authentication
const CLIENT_ID = process.env.CLIENT_ID;

// Exported sign-up function to handle new user registration
exports.signUp = async (event) => {
  // Parse the incoming requiest body to extract user data
  const { email, password, fullName } = JSON.parse(event.body);

  // Generate a unique username from email (remove @ and domain, add timestamp)
  // This is just an internal ID - users will still login with email
  const username = email.split("@")[0] + "_" + Date.now();

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
        Value: fullName,
      }, // Full name attribute
    ],
  };

  try {
    // Create the user in Cognito user pool
    const command = new SignUpCommand(params);

    //Execute the sign-up request
    await client.send(command);

    // Return success response to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User successfully signed up!",
        username: username, // Save this username for confirmation step
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
