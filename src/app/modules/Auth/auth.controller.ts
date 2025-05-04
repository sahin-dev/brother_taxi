import { Request, response, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import ApiResponse from "../../../shared/ApiResponse";
import httpStatus from "http-status";


const verifyWithEmail = catchAsync(async (req:Request, res:Response)=>{
  const {email, requestType} = req.body

  const result = await AuthServices.verifyWithEmail(email,requestType)
  ApiResponse(res,{
    statusCode:httpStatus.OK,
    success:true,
    message:"OTP sent successfully",
    data:result
  })
})

const verifyRequestWithEmail = catchAsync(async (req:Request, res:Response)=>{  
  const {email, otp, requestType, fcmToken} = req.body

  const result = await AuthServices.verifyRequestWithEmail(email,otp,requestType,fcmToken)
  ApiResponse(res,{
    statusCode:requestType.toLowerCase() === "signup" ? httpStatus.CREATED : httpStatus.OK,
    success:true,
    message:"OTP verified successfully",
    data:result
  })
})

const verifyPhone = catchAsync(async (req:Request, res:Response)=>{
  const result = await AuthServices.verifyPhoneNumber(req.body)
  ApiResponse(res,{
    statusCode:httpStatus.OK,
    success:true,
    message:"OTP sent successfully",
    data:result
  })
})

const appleLogin = catchAsync(async (req:Request, res:Response)=>{
  
  const result = await AuthServices.appleLogin(req.user)
})

const googleLogin = catchAsync(async (req:Request, res:Response)=>{
  const result = await AuthServices.googleLogin(req.user)
  ApiResponse(res, {
    statusCode:httpStatus.OK,
    success:true,
    message:"User is authenticated",
    data:result
  })
})

const verifyRequest = catchAsync(async (req:Request, res: Response)=>{
  const result = await AuthServices.verifyRequest(req.body)
  const requestType = req.body.requestType

  ApiResponse(res, {
    statusCode:requestType.toLowerCase() === "signup" ? httpStatus.CREATED : httpStatus.OK,
    success:true,
    message:"Request verified successfully",
    data:result
  })
})

const initiateLogin = catchAsync(async (req:Request, res:Response)=>{
  const result = await AuthServices.initiateLogin(req.body)
  ApiResponse(res,{
    statusCode:httpStatus.OK,
    success:true,
    message:"Login request initiated",
    data:result
  })
})

const loginUser = catchAsync(async (req: Request, res: Response) => {

  const result = await AuthServices.loginUser(req.body);
  res.cookie("token", result.token, { httpOnly: true });
  ApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});


const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  ApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// // get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
 
  const user = req.user;

  const result = await AuthServices.getMyProfile(user.id as string);
  ApiResponse(res, {
    success: true,
    statusCode: 200,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// // change password
// const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const userToken = req.headers.authorization;
//   const { oldPassword, newPassword } = req.body;

//   const result = await AuthServices.changePassword(
//     userToken as string,
//     newPassword,
//     oldPassword
//   );
//   ApiResponse(res, {
//     success: true,
//     statusCode: 201,
//     message: "Password changed successfully",
//     data: result,
//   });
// });


// // forgot password
// const forgotPassword = catchAsync(async (req: Request, res: Response) => {

//   const result= await AuthServices.forgotPassword(req.body);

//   ApiResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Check your email!",
//       data: result
//   })
// });
const resendOtp = catchAsync(async (req: Request, res: Response) => {

  const result= await AuthServices.resendOtp(req.body.email);

  ApiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Check your email!",
      data: result
  })
});
// const verifyForgotPasswordOtp = catchAsync(async (req: Request, res: Response) => {

//   const result= await AuthServices.verifyForgotPasswordOtp(req.body);

//   ApiResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Check your email!",
//       data: result
//   })
// });

// const resetPassword = catchAsync(async (req: Request, res: Response) => {



//   await AuthServices.resetPassword( req.body);

//   ApiResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Password Reset!",
//       data: null
//   })
// });


// const changePhone = catchAsync(async (req:Request, rex:Response)=>{

// })

// const verifyPhoneNumber = catchAsync(async (req:Request, res:Response)=>{
//     await 
// })


const sendOtp = catchAsync(async (req:Request, res:Response)=>{
  const {identifier, method, requestType} = req.body
  const result = await AuthServices.sendOtp(identifier,method,requestType)
  ApiResponse(res, {
    statusCode:httpStatus.OK,
    success:true,
    message:"OTP sent successfully",
    data:result
  })
})

const verifyOtp = catchAsync(async (req:Request, res:Response)=>{
  const {identifier, otp, requestType, method} = req.body
  
  const result = await AuthServices.verifyOtp(identifier,otp,requestType,method)
  ApiResponse(res, {
    statusCode:httpStatus.OK,
    success:true,
    message:"OTP verified successfully",
    data:result
  })
})

export const AuthController = {
  loginUser,
  logoutUser,
  getMyProfile,
  verifyPhone, 
  verifyRequest,
  sendOtp,
  verifyOtp,
//   changePassword,
//   forgotPassword,
//   resetPassword,
  resendOtp,
//   verifyForgotPasswordOtp,
//   changePhone
    initiateLogin,
    appleLogin,
    googleLogin,
    verifyWithEmail,
    verifyRequestWithEmail
};
