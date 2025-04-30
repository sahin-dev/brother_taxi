export const authDocs = {
  openapi: "3.0.0",
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
  ],
  paths: {
    "/auth/verify-phone": {
      post: {
        tags: ["Auth"],
        summary: "Send OTP to phone",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phone: { type: "string", example: "01712345678" },
                  requestType: {
                    type: "string",
                    enum: ["SIGN_UP", "LOGIN", "CHANGE_PHONE"],
                    example: "LOGIN",
                  },
                },
                required: ["phone", "requestType"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP sent successfully" },
          400: { description: "Invalid request" },
        },
      },
    },

    "/auth/verify-request": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP for login or phone change",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phone: { type: "string", example: "01712345678" },
                  otp: { type: "string", example: "123456" },
                  requestType: {
                    type: "string",
                    enum: ["SIGN_UP", "LOGIN", "CHANGE_PHONE"],
                    example: "LOGIN",
                  },
                  newPhone: { type: "string", example: "01798765432" },
                  fcmToken: { type: "string", example: "firebase_token" },
                },
                required: ["phone", "otp", "requestType"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP verified" },
          400: { description: "Verification failed" },
        },
      },
    },

    "/auth/login-attempt": {
      post: {
        tags: ["Auth"],
        summary: "Initiate login attempt",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phone: { type: "string", example: "01712345678" },
                },
                required: ["phone"],
              },
            },
          },
        },
        responses: {
          200: { description: "Login attempt started" },
          400: { description: "Bad request" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "User login with OTP or provider",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phone: { type: "string", example: "01712345678" },
                  otp: { type: "string", example: "123456" },
                  fcmtoken: { type: "string", example: "firebase_token" },
                  provider: { type: "string", example: "google" },
                  appleId: { type: "string", example: "apple_unique_id" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User logged in" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        responses: {
          200: { description: "User logged out" },
        },
      },
    },

    "/auth/get-me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User profile returned" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/auth/resend-otp": {
      post: {
        tags: ["Auth"],
        summary: "Resend OTP",
        responses: {
          200: { description: "OTP resent" },
          400: { description: "Bad request" },
        },
      },
    },

    "/auth/google-login": {
      get: {
        tags: ["Auth"],
        summary: "Start Google login flow",
        responses: {
          302: { description: "Redirect to Google login" },
        },
      },
    },

    "/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google login callback",
        responses: {
          200: { description: "Google login successful" },
          401: { description: "Google login failed" },
        },
      },
    },

    "/auth/apple-login": {
      get: {
        tags: ["Auth"],
        summary: "Start Apple login flow",
        responses: {
          302: { description: "Redirect to Apple login" },
        },
      },
    },

    "/auth/apple/callback": {
      post: {
        tags: ["Auth"],
        summary: "Apple login callback",
        responses: {
          200: { description: "Apple login successful" },
          401: { description: "Apple login failed" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
