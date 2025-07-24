exports.test = async (event) => {
  try {
    // 인증된 사용자 정보 확인
    console.log("Event:", JSON.stringify(event, null, 2));

    const user = event.requestContext?.authorizer;
    console.log("Authorizer:", JSON.stringify(user, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Authentication successful!",
        user: user,
        headers: event.headers,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
