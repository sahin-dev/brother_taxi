
window.onload = function() {
    // Build a system
    var url = window.location.search.match(/url=([^&]+)/);
    if (url && url.length > 1) {
      url = decodeURIComponent(url[1]);
    } else {
      url = window.location.origin;
    }
    var options = {
    "swaggerDoc": {
      "openapi": "3.0.3",
      "info": {
        "title": "Roady API",
        "version": "1.0.0",
        "description": "API documentation for Roady App"
      },
      "servers": [
        {
          "url": "http://localhost:3000/api/v1"
        }
      ],
      "components": {
        "securitySchemes": {
          "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
          }
        }
      },
      "paths": {
        "openapi": {
          "0": "3",
          "1": ".",
          "2": "0",
          "3": ".",
          "4": "3"
        },
        "info": {
          "title": "Auth API",
          "version": "1.0.0",
          "description": "API endpoints for authentication and user login via phone/OTP, Google, and Apple."
        },
        "servers": {
          "0": {
            "url": "http://localhost:3000/api/v1/auth",
            "description": "Local development server"
          }
        },
        "/verify-phone": {
          "post": {
            "summary": "Send OTP to phone",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": [
                      "phone",
                      "requestType"
                    ],
                    "properties": {
                      "phone": {
                        "type": "string"
                      },
                      "requestType": {
                        "type": "string",
                        "enum": [
                          "LOGIN",
                          "SIGNUP",
                          "CHANGE_PHONE",
                          "FORGOT_PASSWORD"
                        ]
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "OTP sent successfully"
              }
            }
          }
        },
        "/verify-request": {
          "post": {
            "summary": "Verify OTP",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": [
                      "phone",
                      "otp",
                      "requestType"
                    ],
                    "properties": {
                      "phone": {
                        "type": "string"
                      },
                      "otp": {
                        "type": "string"
                      },
                      "requestType": {
                        "type": "string",
                        "enum": [
                          "LOGIN",
                          "SIGNUP",
                          "CHANGE_PHONE",
                          "FORGOT_PASSWORD"
                        ]
                      },
                      "newPhone": {
                        "type": "string"
                      },
                      "fcmToken": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Verification successful"
              }
            }
          }
        },
        "/login-attempt": {
          "post": {
            "summary": "Initiate login by sending OTP",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": [
                      "phone"
                    ],
                    "properties": {
                      "phone": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "OTP sent for login"
              }
            }
          }
        },
        "/login": {
          "post": {
            "summary": "Login with OTP or provider",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "phone": {
                        "type": "string"
                      },
                      "otp": {
                        "type": "string"
                      },
                      "fcmtoken": {
                        "type": "string"
                      },
                      "provider": {
                        "type": "string"
                      },
                      "appleId": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Login successful"
              }
            }
          }
        },
        "/logout": {
          "post": {
            "summary": "Logout current user",
            "responses": {
              "200": {
                "description": "Logout successful"
              }
            }
          }
        },
        "/get-me": {
          "get": {
            "summary": "Get current user profile",
            "security": [
              {
                "bearerAuth": []
              }
            ],
            "responses": {
              "200": {
                "description": "User profile data"
              }
            }
          }
        },
        "/resend-otp": {
          "post": {
            "summary": "Resend the OTP to a user",
            "responses": {
              "200": {
                "description": "OTP resent"
              }
            }
          }
        },
        "/google-login": {
          "get": {
            "summary": "Start Google OAuth login flow",
            "responses": {
              "302": {
                "description": "Redirect to Google login"
              }
            }
          }
        },
        "/google/callback": {
          "get": {
            "summary": "Google OAuth callback",
            "responses": {
              "200": {
                "description": "Google login success or redirect"
              }
            }
          }
        },
        "/apple-login": {
          "get": {
            "summary": "Start Apple OAuth login flow",
            "responses": {
              "302": {
                "description": "Redirect to Apple login"
              }
            }
          }
        },
        "/auth/apple/callback": {
          "post": {
            "summary": "Apple OAuth callback",
            "responses": {
              "200": {
                "description": "Apple login successful"
              }
            }
          }
        }
      },
      "tags": []
    },
    "customOptions": {}
  };
    url = options.swaggerUrl || url
    var urls = options.swaggerUrls
    var customOptions = options.customOptions
    var spec1 = options.swaggerDoc
    var swaggerOptions = {
      spec: spec1,
      url: url,
      urls: urls,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    }
    for (var attrname in customOptions) {
      swaggerOptions[attrname] = customOptions[attrname];
    }
    var ui = SwaggerUIBundle(swaggerOptions)
  
    if (customOptions.oauth) {
      ui.initOAuth(customOptions.oauth)
    }
  
    if (customOptions.preauthorizeApiKey) {
      const key = customOptions.preauthorizeApiKey.authDefinitionKey;
      const value = customOptions.preauthorizeApiKey.apiKeyValue;
      if (!!key && !!value) {
        const pid = setInterval(() => {
          const authorized = ui.preauthorizeApiKey(key, value);
          if(!!authorized) clearInterval(pid);
        }, 500)
  
      }
    }
  
    if (customOptions.authAction) {
      ui.authActions.authorize(customOptions.authAction)
    }
  
    window.ui = ui
  }
  