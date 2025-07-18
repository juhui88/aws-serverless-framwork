const {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: "ap-southeast-2",
});

const CLIENT_ID = process.env.CLIENT_ID;
exports.confirmSignUp = async (event) => {
  const { email, confirmationCode, username } = JSON.parse(event.body);

  const params = {
    ClientId: CLIENT_ID,
    Username: username, // Use the username from signUp response
    ConfirmationCode: confirmationCode, // Correct field name
  };

  try {
    const command = new ConfirmSignUpCommand(params);

    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User successfully confirmed!",
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Confirmation failed",
        error: error.message,
      }),
    };
  }
};
