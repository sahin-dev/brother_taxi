import express from "express";
import validateRequest from "../../middlewares/validation.middleware";
import { AuthController } from "./auth.controller";
// import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth.middleware";
// import {UserRole} from '@prisma/client'
import { UserLoginValidationSchema, changePasswordValidationSchema, changePhoneNumberSchema } from "./auth.validation";


const router = express.Router();

// user login route
router.post(
  "/login",
  validateRequest(UserLoginValidationSchema),
  AuthController.loginUser
);



// // user logout route
// router.post("/logout", AuthController.logoutUser);

// router.get(
//   "/get-me",
//   auth(UserRole.ADMIN, UserRole.USER),
//   AuthController.getMyProfile
// );

// router.put(
//   "/change-password",
//   auth(),
//   validateRequest(changePasswordValidationSchema),
//   AuthController.changePassword
// );

// router.post ('/verify-phone',auth(),)
// router.put("/change-phone", auth(), validateRequest(changePhoneNumberSchema))

// router.post(
//   '/forgot-password',
//   AuthController.forgotPassword
// );
// router.post(
//   '/resend-otp',
//   AuthController.resendOtp
// );
// router.post(
//   '/verify-otp',
//   AuthController.verifyForgotPasswordOtp
// );

// router.post(
//   '/reset-password',
//   AuthController.resetPassword
// )

export const AuthRoutes = router;
