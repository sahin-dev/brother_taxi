
import ApiError from "../../../errors/ApiError";
import { generateOtp } from "../../../helpers/generateOtp";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { jwtHelpers } from "../../../helpers/jwt";
import config from "../../../config";
import { ObjectId } from "mongodb";
import { UserRole } from "@prisma/client";


export const loginUserIntoDB = async (payload: {countryCode:string, phone:string,role:UserRole ,otp?:string, fcmToken?:string}) => {

  let accessToken;
  let userInfo;
  

  const user = await prisma.user.findUnique({
    where: {
      phone: payload.phone,
    }
  });



  if (!user) {
    const otp = generateOtp()
    const otpExpiresIn = new Date(Date.now() + 10 *60*1000)
   
    const createUser = await prisma.user.create({
      data: {
        phone:payload.phone,
        role:payload.role,
        otp,
        otpExpiresIn
      },
    });


    // accessToken = jwtHelpers.generateToken(
    //   {
    //     id: createUser.id,
    //     phone: createUser.phone,
    //     fcmToken: createUser?.fcmToken,
    //     subscription: createUser?.subcription,
    //   },
    //   config.jwt.jwt_secret as string,
    //   config.jwt.expires_in as string
    // );

    // const {status, createdAt, updatedAt, ...others } = createUser;
    // userInfo = others;
    const messageBody = `Your login verification code is ${otp}. Your otp will expires in 10 minutes`
    // await sendMessage(messageBody, createUser.phone)
    return {message:messageBody}
  }

  if (!payload.otp){
    const otp = generateOtp()
    const otpExpiresIn = new Date(Date.now() + 10 *60*1000)
    const messageBody = `Your login verification code is ${otp}. Your otp will expires in 10 minutes`
    await prisma.user.update({where:{id:user.id}, data:{otp, otpExpiresIn}})
    try{
      const formattedPhone = `${payload.countryCode} ${payload.phone}`;
      console.log("Formatted Phone:", formattedPhone);
      //  await sendMessage(messageBody, formattedPhone)
    } catch(err:any){
      console.error("Failed to send OTP message:", err);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP message")
    }
   
    return {message:messageBody}
  }
    

  if (user.otp !== payload.otp || (!user.otpExpiresIn  && user.otpExpiresIn! < new Date(Date.now()))){
    throw new ApiError(httpStatus.BAD_REQUEST, "Otp invalid")
  }

  console.log(config.jwt)

    accessToken = jwtHelpers.generateToken(
      {
        id: user?.id,
        phone: user?.phone,
        fcmToken: payload.fcmToken,
        subscription: user?.subcription,
      },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string
    );
 
    const updateUserInfo = await prisma.user.update({
      where: {
        phone: payload.phone,
      },
      data: {
        fcmToken: payload.fcmToken,
        accessToken: accessToken,
        otp:null,
        otpExpiresIn:null
      },
    });

    const {
      createdAt,
      updatedAt,
      accessToken: token,
      ...others
    } = updateUserInfo;
    userInfo = others;
  

  return {
    accessToken,
    userInfo,
  };
};


export const logoutUser = async (userId:string)=>{
  const user = await prisma.user.findUnique({where:{id:userId}})

  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  await prisma.user.update ({where:{id:userId}, data:{accessToken:null}})

  return {message:"User logged out successfully"}
}

// get profile for logged in user
const getProfileFromDB = async (userId: string) => {

  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(404, "user not found!");
  }

  const { createdAt, updatedAt, ...sanitizedUser } = user;

  return sanitizedUser;
};

// update user profile only logged in user
export const updateProfileIntoDB = async (
  userId: string,
  userData: any
) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "user not found for edit user");
  }
  //check email uniquesness
  if (userData.email){
    const existingUser = await prisma.user.findFirst({where:{email:userData.email}})
    if (existingUser){
      throw new ApiError(httpStatus.CONFLICT, "User already exist with this email",userData.email)
    }
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: userData.username || user.name,
      email:userData.email || user.email
    },
  });

  const {  ...sanitizedUser } = updatedUser;

  return sanitizedUser;
};


// const verifyToken = (token: string) => {
//   try {
//     const decoded = jwt.decode(token);
//     return decoded;
//   } catch (error: any) {
//     console.error("❌ Token Verification Failed:", error.message);
//     throw error;
//   }
// };

// Step 3: Fetch User Profile
// const fetchUserProfile = async (token: string) => {
//   const response = await axios.get(`${process.env.AUTH0_DOMAIN}/userinfo`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.data) {
//     throw new ApiError(404, "User not found");
//   }

//   return response.data;
// };

// const loginAuthProvider = async (payload: {
//   username: string;
//   password: string;
//   fcmToken?: string;
// }) => {
//   const existingUser = await prisma.user.findFirst({
//     where: { name: payload.username },
//     include: { subscription: true },
//   });

//   if (!existingUser) {
//     throw new ApiError(404, "User not found");
//   }

//   if (existingUser.role !== "USER") {
//     const accessToken = jwtHelpers.generateToken(
//       {
//         id: existingUser.id,
//         email: existingUser.email,
//         role: existingUser.role,
//         fcmToken: existingUser?.fcmToken,
//         subscription: existingUser.subcription,
//       },
//       config.jwt.jwt_secret as string,
//       config.jwt.expires_in as string
//     );

//     const updatedUser = await prisma.user.update({
//       where: { phone: existingUser.phone },
//       data: {
//         fcmToken: payload.fcmToken ? payload.fcmToken : existingUser?.fcmToken,
//         accessToken: accessToken,
//       },
//     });

//     const { ...userInfo } = updatedUser;

//     return {
//       accessToken,
//       userInfo,
//     };
//   }

//   const response = await axios.post(
//     `${process.env.AUTH0_DOMAIN}/oauth/token`,
//     {
//       grant_type: "password",
//       username: payload.username,
//       password: payload.password,
//       audience: process.env.AUTH0_AUDIENCE,
//       client_id: process.env.AUTH0_CLIENT_ID,
//       client_secret: process.env.AUTH0_CLIENT_SECRET,
//       connection: "Username-Password-Authentication",
//       scope: "openid profile email",
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   const token = response.data.access_token;

//   verifyToken(token);
//   const user = await fetchUserProfile(token);

//   if (existingUser.subscription.length === 0) {
//     throw new ApiError(401, "need subscripion to min a plan");
//   }

//   const accessToken = jwtHelpers.generateToken(
//     {
//       id: existingUser.id,
//       email: existingUser.email,
//       role: existingUser.role,
//       fcmToken: existingUser?.fcmToken,
//       subscription: existingUser.subcription,
//     },
//     config.jwt.jwt_secret as string,
//     config.jwt.expires_in as string
//   );

//   const updatedUser = await prisma.user.update({
//     where: { phone: user.phone },
//     data: {
//       fcmToken: payload.fcmToken ? payload.fcmToken : existingUser?.fcmToken,
//       accessToken: accessToken,
//     },
//   });

//   const {  ...userInfo } = updatedUser;

//   return {
//     accessToken,
//     userInfo,
//   };
// };
