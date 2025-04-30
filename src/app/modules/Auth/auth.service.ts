import { RequestType, User, UserStatus } from "@prisma/client";

import * as bcrypt from "bcrypt";
import crypto, { verify } from "crypto";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { generateToken ,verifyToken} from "../../../helpers/jwt";
import emailSender from "../../../shared/mailSender";
import prisma from "../../db/client";
import { generateOtp } from "../../../helpers/generateOtp";
import jwt from "jsonwebtoken";
import { getApplePublicKey } from "../../../helpers/applePublicKey";




const initiateLogin = async (payload: {phone:string})=>{
  
  //Send this otp to user through email or phone whatever client prefer.
  //save to database
  
    const user = await prisma.user.findFirst({where:{phone:payload.phone}})
    if(!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    const otp =  generateOtp()
    const expirationDate = new Date(Date.now() + 5 *60*1000)

    //   // Create email content
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Here is your new OTP code to complete the process.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need further assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">levimusuc@team.com</span><br/>
                    <a href="mailto:support@booksy.buzz.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
  `;

  // Send the OTP to user's email
  if (user.email)
    await emailSender(user.email, html, "Resend OTP");
   
    await prisma.user.update({where:{id:user.id}, data:{otp,otpExpiresIn:expirationDate}})
    
    
    return {message:  "Otp generated successfully"}

}


// user login
//check otp
//inavalidate otp
const loginUser = async (payload: {phone: string,otp:string,fcmtoken?:string}) => {
  
  const user = await prisma.user.findFirst({where:{phone:payload.phone}})

  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
  }
  if(!user.otp){
    throw new ApiError(httpStatus.NOT_FOUND, "Otp not found")
  }
  
  if (payload.otp !== user.otp){
    throw new ApiError(httpStatus.BAD_REQUEST, "Otp is incorrect")
  }

 
  if ( (!user.otpExpiresIn || user.otpExpiresIn < new Date())){
    throw new ApiError(httpStatus.BAD_REQUEST, "Otp is invalid")
  }
  

  await prisma.user.update({where:{id:user.id},data:{otp:"", otpExpiresIn:""}})

  if (payload && payload.fcmtoken) {
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: payload.fcmtoken },
    });
  }

  const accessToken = generateToken(
    {
      id: user.id,
      phone: user.phone,
      role:user.role
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { token: accessToken };
};


const googleLogin = async (googleProfile:any)=>{
  const id = googleProfile.id as string
  let user = await prisma.user.findFirst({where:{googleId:googleProfile.id}})
  console.log(id)
  if (!user){
    
    user =  await prisma.user.create({data:{googleId:id,username:googleProfile.displayName, firstName:googleProfile.name?.givenName,lastName:googleProfile.name?.familyName,email:googleProfile.emails[0].value}})
  }

  const accessToken = generateToken(
    {
      id: user.id,
      phone: user.phone,
      role:user.role
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {token:accessToken}
}

const appleLogin = async (appleProfile:any)=>{

  // const decodeHeader = jwt.decode(token, {complete:true})
  // const appleKey = await getApplePublicKey(decodeHeader?.header.kid as string) as string
  // const payload = jwt.verify(token, appleKey);
  // if (payload.sub === user){
    
  // }
}

// // get user profile
const getMyProfile = async (userToken: string) => {
  const decodedToken = verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const userProfile = await prisma.user.findUnique({
    where: {
      id: decodedToken.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      gender: true,
      dob: true,
      isPayment: true,
      planName: true,
      fcmToken: true,
      priceId: true,
      subscriptionId: true,
      sexOrientation: true,
      education: true,
      interests: true,
      distance: true,
      favoritesFood: true,
      photos: true,
   
      about: true,
      lat: true,
      long: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return userProfile;
};

const verifyWithEmail = async (email:string,requetsType:RequestType)=>{
  let user = await prisma.user.findFirst({where:{email}})

  if (requetsType === RequestType.LOGIN){
    
    if (!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    
    
  }else if (requetsType === RequestType.CHANGE_PHONE){ 

    if (!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found")
    }


  }else if (requetsType === RequestType.SIGNUP){

    if (user){

      throw new ApiError(httpStatus.BAD_REQUEST, `User with this email ${email} already exist.`)
    }

    user = await prisma.user.create({data:{email}})


    
  }

  
  const otp = generateOtp()
  const otpExpiary = new Date(Date.now() + 5 * 60 * 1000)
  if (user)
    await prisma.user.update({where:{id:user.id},data:{otp,otpExpiresIn:otpExpiary}})

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Here is your new OTP code to complete the ${requetsType} request.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need further assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">`

  emailSender(email, html, "Otp verification for Roady App")
}

const verifyRequestWithEmail = async (email:string, otp:string, requestType:RequestType, newPhone?:string,fcmToken?:string)=>{
  const user = await prisma.user.findFirst({where:{email}})

  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  if(!user.otp){
    throw new ApiError(httpStatus.NOT_FOUND, "Otp is not present")
  }
  
 
  if (user.otp !== otp || !user.otpExpiresIn || user.otpExpiresIn < new Date()){
    throw new ApiError (httpStatus.BAD_REQUEST, "Otp is invalid")
  }
  await prisma.user.update({where:{id:user.id}, data:{otp:null, otpExpiresIn:null}})
  let result;
  if (requestType === RequestType.LOGIN){

    if (fcmToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fcmToken:fcmToken },
      });
    }
  
    const accessToken = generateToken(
      {
        id: user.id,
        phone: user.phone,
        role:user.role
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.expires_in as string
    );
  
    result =  { token: accessToken };
  

  }else if(requestType === RequestType.SIGNUP) {

    await prisma.user.update({where:{id:user.id}, data:{status:UserStatus.ACTIVE}})
    result =  {message:"User account active"}

  }else if (requestType === RequestType.CHANGE_PHONE){

    await prisma.user.update({where:{id:user.id}, data:{phone:newPhone}})
    result = {message:"Phone number change successfully."}

  }
  return result
}



const verifyPhoneNumber = async ({phone,requestType}:{phone:string, requestType:string})=>{

  if (requestType === RequestType.LOGIN){
    const user = await prisma.user.findFirst({where:{phone}})
    if (!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    const otp = generateOtp()
    const otpExpiary = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.user.update({where:{id:user.id},data:{otp,otpExpiresIn:otpExpiary}})
   
    return {message:"Otp send successfully"}

  }else if (requestType === RequestType.CHANGE_PHONE){
    const user = await prisma.user.findFirst({where:{phone}})
    if (!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found")
    }

    const otp = generateOtp()
    const otpExpiary = new Date(Date.now() + 5 * 60 * 1000)
    await prisma.user.update({where:{id:user.id},data:{otp,otpExpiresIn:otpExpiary}})

    
    return {message:"Otp send successfully"}

  }else if (requestType === RequestType.SIGNUP){

    const userPresent = await checkUserExistence(phone)

    if (userPresent){

      throw new ApiError(httpStatus.BAD_REQUEST, `User with this phone ${phone} already exist.`)
    }

    const otp = generateOtp()
    const otpExpiary = new Date(Date.now() + 15 * 60 * 1000)

    
    await prisma.user.create({data:{phone,otp,otpExpiresIn:otpExpiary}})


    return {message:"Otp sent successfully. Otp willbe valid for 15 minutes."}
  }
}

const verifyRequest  = async ({phone,otp,requestType, newPhone,fcmToken}:{phone:string, otp:string,requestType:RequestType,newPhone?:string,fcmToken?:string})=>{

  const user = await prisma.user.findFirst({where:{phone}})

  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  if(!user.otp){
    throw new ApiError(httpStatus.NOT_FOUND, "Otp is not present")
  }
  
 
  if (user.otp !== otp || !user.otpExpiresIn || user.otpExpiresIn < new Date()){
    throw new ApiError (httpStatus.BAD_REQUEST, "Otp is invalid")
  }
  await prisma.user.update({where:{id:user.id}, data:{otp:null, otpExpiresIn:null}})
  let result;
  if (requestType === RequestType.LOGIN){

    if (fcmToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fcmToken:fcmToken },
      });
    }
  
    const accessToken = generateToken(
      {
        id: user.id,
        phone: user.phone,
        role:user.role
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.expires_in as string
    );
  
    result =  { token: accessToken };
  

  }else if(requestType === RequestType.SIGNUP) {

    await prisma.user.update({where:{id:user.id}, data:{status:UserStatus.ACTIVE}})
    result =  {message:"User account active"}

  }else if (requestType === RequestType.CHANGE_PHONE){

    await prisma.user.update({where:{id:user.id}, data:{phone:newPhone}})
    result = {message:"Phone number change successfully."}

  }
  return result
}

const checkUserExistence = async (phone:string)=>{
  const user = await prisma.user.findFirst({where:{phone}})
  if (user){
    return true
  }
  return false
}


// // change password

const changePhoneNumber = async (token:string,newPhone:string, oldPhone:string)=>{
  const decode = verifyToken(token,config.jwt.jwt_secret!)
  const user = await prisma.user.findUnique({where:{id:decode.id}})
  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
  }
  if (user.phone !== oldPhone || user.deleted){
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect phone number")
  }

  const otp =  generateOtp()
  const expirationDate = new Date(Date.now() + 5*60*1000)
  await prisma.user.update({where:{id:decode.id}, data:{otp:otp,otpExpiresIn:expirationDate.toISOString()}})

  return {message:"Otp send successfully"}
}

const verifyChangePhoneNumberOtp = async (token:string, otp:string, newPhone:string)=>{
  const decode = verifyToken(token, config.jwt.jwt_secret!)
  const user = await prisma.user.findUnique({where:{id:decode.id}})

  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  if (user.otp !== otp || !user.otpExpiresIn || user.otpExpiresIn < new Date()){
    throw new ApiError(httpStatus.BAD_REQUEST, "Otp is invalid")
  }


  await prisma.user.update({where:{id:decode.id},data:{phone:newPhone,otp:null,otpExpiresIn:null}})
  return {message:"Phone number changed successfully"}
}

// const checkPhoneNumber = async (phone:string)=>{
//   const user = await prisma.user.findUnique({where:{phone}})
//   if(user){

//   }
// }
// const changePassword = async (
//   userToken: string,
//   newPassword: string,
//   oldPassword: string
// ) => {
//   const decodedToken = verifyToken(
//     userToken,
//     config.jwt.jwt_secret!
//   );

//   const user = await prisma.user.findUnique({
//     where: { id: decodedToken?.id },
//   });

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Incorrect old password");
//   }

//   const hashedPassword = await bcrypt.hash(newPassword, 12);

//   const result = await prisma.user.update({
//     where: {
//       id: decodedToken.id,
//     },
//     data: {
//       password: hashedPassword,
//     },
//   });
//   return { message: "Password changed successfully" };
// };

// const forgotPassword = async (payload: { email: string }) => {
//   // Fetch user data or throw if not found
//   const userData = await prisma.user.findFirstOrThrow({
//     where: {
//       email: payload.email,
//     },
//   });

//   // Generate a new OTP
//   const otp = Number(crypto.randomInt(1000, 9999));

//   // Set OTP expiration time to 10 minutes from now
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//   // Create the email content
//   const html = `
// <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
//     <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
//         <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
//             <span style="color: #ffeb3b;">Forgot Password OTP</span>
//         </h2>
//         <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
//             Your forgot password OTP code is below.
//         </p>
//         <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
//             ${otp}
//         </p>
//         <div style="text-align: center; margin-bottom: 20px;">
//             <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
//                 This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
//             </p>
//             <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
//                 If you need assistance, feel free to contact us.
//             </p>
//         </div>
//         <div style="text-align: center; margin-top: 30px;">
//             <p style="font-size: 12px; color: #999; text-align: center;">
//                 Best Regards,<br/>
//                 <span style="font-weight: bold; color: #3f51b5;">nathancloud Team</span><br/>
//                 <a href="mailto:support@nathancloud.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
//             </p>
//         </div>
//     </div>
// </div> `;

//   // Send the OTP email to the user
//   await emailSender(userData.email, html, "Forgot Password OTP");

//   // Update the user's OTP and expiration in the database
//   await prisma.user.update({
//     where: { id: userData.id },
//     data: {
//       otp: otp,
//       expirationOtp: otpExpires,
//     },
//   });

//   return { message: "Reset password OTP sent to your email successfully" };
// };

const resendOtp = async (phone: string) => {
  // Check if the user exists
  const user = await prisma.user.findFirst({
    where: { phone },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Generate a new OTP
  const otp = generateOtp()

  // Set OTP expiration time to 5 minutes from now
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  // Create email content
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Here is your new OTP code to complete the process.
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need further assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">levimusuc@team.com</span><br/>
                    <a href="mailto:support@booksy.buzz.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
  `;

  // Send the OTP to user's email
  if(user.email)
    await emailSender(user.email, html, "Resend OTP");

  // Update the user's profile with the new OTP and expiration
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: otp,
      otpExpiresIn: otpExpires,
    },
  });

  return { message: "OTP resent successfully" };
};

// const verifyForgotPasswordOtp = async (payload: {
//   email: string;
//   otp: number;
// }) => {
//   // Check if the user exists
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
//   }

//   // Check if the OTP is valid and not expired
//   if (
//     user.otp !== payload.otp ||
//     !user.expirationOtp ||
//     user.expirationOtp < new Date()
//   ) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
//   }

//   // Update the user's OTP, OTP expiration, and verification status
//   await prisma.user.update({
//     where: { id: user.id },
//     data: {
//       otp: null, // Clear the OTP
//       expirationOtp: null, // Clear the OTP expiration
//       status: UserStatus.ACTIVE,
//     },
//   });

  
//   const token= await  generateToken({id: user.id,
//     email: user.email,
//     role: user.role}, config.jwt.jwt_secret as Secret, config.jwt.expires_in as string);

//   return { message: "OTP verification successful", token: token };
// };

// // reset password
// const resetPassword = async (payload: { password: string; email: string }) => {
//   // Check if the user exists
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
//   }

//   // Hash the new password
//   const hashedPassword = await bcrypt.hash(payload.password, 10);

//   // Update the user's password in the database
//   await prisma.user.update({
//     where: { email: payload.email },
//     data: {
//       password: hashedPassword, // Update with the hashed password
//       otp: null, // Clear the OTP
//       expirationOtp: null, // Clear OTP expiration
//     },
//   });

//   return { message: "Password reset successfully" };
// };

// const changePhone = async (payload:{email:string,newPhone:string})=>{
//     const user = await prisma.user.findUnique({where:{email:payload.email}})
//     if (!user){
//         throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
//     }
//     await prisma.user.update({where:{id:user.id}, data:{phone:payload.newPhone}})

//     return {message:"Phone number changed successfully"}
// }

// const verifyPhone = async (payload:{phone:string})=>{
//     const user  = await prisma.user.findUnique({where:{phone:payload.phone}})
//     if (user){
//         throw new ApiError(httpStatus.CONFLICT, "Phone already exist.")
//     }
//     const otp =  Math.floor(100000 + Math.random() * 900000).toString()
//     await prisma.verifyPhone.create({data:{otp,phone:payload.phone}})
//     return {message:"Otp sent to your phone number"}
// }

// const verifySignInOtp = async (payload:{phone:string, otp:string})=>{
//     const verifyPhone = await prisma.verifyPhone.findUnique({where:{phone:payload.phone}})
//     if (!verifyPhone){
//         throw new ApiError(httpStatus.NOT_FOUND, "Otp invalid!")
//     }
//     if (verifyPhone.otp != payload.otp){
//         throw new ApiError(httpStatus.UNAUTHORIZED, "Otp does not match!")
//     }
//     return {message:"Phone number verified successfully"}
// }

export const AuthServices = {
  initiateLogin,
  loginUser,
  getMyProfile,
  verifyPhoneNumber,
  verifyRequest,
  appleLogin,
  googleLogin,
  verifyWithEmail,
  verifyRequestWithEmail,
//   changePassword,
//   forgotPassword,
//   resetPassword,
  resendOtp,
//   verifyForgotPasswordOtp,
//   verifyPhone,
//   verifySignInOtp

};
