import express, {Request, Response} from "express";
import validateRequest from "../../middlewares/validation.middleware";
import { AuthController } from "./auth.controller";
// import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth.middleware";
// import {UserRole} from '@prisma/client'
import { UserLoginValidationSchema, changePasswordValidationSchema, changePhoneNumberSchema, loginAttemptSchema, verifyOtpSchema, verifyPhoneSchema } from "./auth.validation";

import '../../../helpers/passport'
import passport from 'passport'

const router = express.Router();


router.post('/verify-phone', validateRequest(verifyPhoneSchema),AuthController.verifyPhone)
router.post('/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOtp)


//login-attempt
router.post('/login-attempt', validateRequest(loginAttemptSchema) ,AuthController.initiateLogin)
// user login route
router.post(
  "/login",
  validateRequest(UserLoginValidationSchema),
  AuthController.loginUser
);



// // user logout route
router.post("/logout", AuthController.logoutUser);

router.get(
  "/get-me",
  auth(),
  AuthController.getMyProfile
);
//sign in using google
router.get('/google', passport.authenticate("google",{
  scope:["email", "profile"]
}))

router.get('/google/callback', passport.authenticate('google', {failureRedirect:"login"}), (req:Request, res:Response)=>{
res.send(req.user)
})

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
