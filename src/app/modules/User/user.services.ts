import { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
// import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import emailSender from "../../../shared/mailSender";
// import { generateOtpEmailHtml } from "../../../shared/html";
import prisma from "../../../shared/prisma";
import { userSearchAbleFields } from "./user.costant";
import { IUpdateGenderVisibility, IUser, IUserFilterRequest } from "./user.interface";
import { jwtHelpers } from "../../../helpers/jwt";
import { PassThrough } from "stream";
import { calculateAge } from "../../../shared/calculateAge";



const initiateSignUp = async (phone:string)=>{
  const existingUser = await prisma.user.findUnique({where:{phone:phone}})
  if (existingUser){
    throw new ApiError(httpStatus.BAD_REQUEST, `User with this phone ${phone} already exist`)
  }
  const otp = Math.floor(1000 + Math.random() * 9000)
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000)

}

const checkEmail = async ({email}:{email:string})=>{
  const user = await prisma.user.findUnique({where:{email:email}})
  if (user){
    throw new ApiError(httpStatus.CONFLICT, "User with this email already exist")
  }
  return {message:"email is accepted"}
}

const checkUsername = async ({username}:{username:string})=>{
  const user = await prisma.user.findUnique({where:{username}})
  if (user){
    throw new ApiError(httpStatus.CONFLICT, "User with this username already exist")
  }
  return {message:"username is accepted"}
}

// Create a new user in the database.
const createUserIntoDb = async (payload:User) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR:[ {email:payload.email}, {username:payload.username}, {phone:payload.phone}]
    },
  });

  if (existingUser) {
    if (existingUser.phone === payload.phone) {
      throw new ApiError(
        400,
        `User with this phone ${payload.phone} already exists`
      );
    }else if (existingUser.email === payload.email){
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`
      );
    }else if (existingUser.username === payload.username){
      throw new ApiError(
        400,
        `User with this username ${payload.username} already exists`
      );
    }
  }

  // const hashedPassword = await bcrypt.hash(
  //   payload.password,
  //   Number(config.bcrypt_salt_rounds)
  // );
  // Generate OTP
  // const otp = Math.floor(1000 + Math.random() * 9000); // 6-digit OTP
  // const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

  // Create the user and save the OTP and expiry in the database
  const newUser = await prisma.user.create({
    data: {
     ...payload
    },
    select: {
      id: true,
      phone: true,
      email:true,
      username:true,
      
      // otp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Send the OTP to the user's email
  try {
    const emailSubject = "Your OTP for Account Verification";

    //const emailHtml = generateOtpEmailHtml(newUser.email, otp);
    //await emailSender(newUser.email, emailHtml, emailSubject);
    //console.log(`OTP sent to ${newUser.email}`);
  } catch (error) {
    console.error(`Failed to send OTP email:`, error);
  }

  return newUser;
};

const deleteAccount = async ({id}:{id:string})=>{
  const user = await prisma.user.findUnique({where:{id}})
  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  await prisma.user.delete({where:{id}})
  return {message:"User deleted successfully"}
}


const updateGenderVisibility = async (payload:IUpdateGenderVisibility)=>{
  const user = await prisma.user.findUnique({where:{id:payload.id}})
  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  await prisma.user.update({where:{id:user.id},data:{genderVisibility:(!user.genderVisibility)}})
  return {message:"Gender visibility updated!"}
}


// reterive all users from the database also searcing anf filetering
const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditons: Prisma.UserWhereInput = { AND: andCondions };

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({
    where: whereConditons,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No active users found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};


const getUserProfile = async (userId:string)=>{
  const user = await prisma.user.findUnique({where:{id:userId}})

  if (!user){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }
  return user
}

// update profile by user won profile uisng token or email and id
// const updateProfile = async (req: Request&{user?:any}) => {
//  try {
//   const files = req.files as any;

//   const stringData = req.body.data;
 
//   let images;
//   let parseData;

//   const existingUser = await prisma.user.findFirst({
//     where: {
//       id: req.user?.id,
//     },
//   });
//   if (!existingUser) {
//     throw new ApiError(404, "User not found");
//   }
//   if (files.images) {

//     images = await Promise.all(
//       files?.images?.map(async (file: any) => {
//         const response = await fileUploader.uploadToDigitalOcean(file);
//         return { url: response.Location }; // Extract and return only the file URL
//       })
//     );
//   }
//   if (stringData) {
//     parseData = JSON.parse(stringData);
//   }
// if(parseData?.dob){
//   parseData.dob = new Date(parseData.dob).toISOString();
// }
  

//   const result = await prisma.user.update({
//     where: {
//       id: existingUser.id,
//     },
//     data: {
//       ...parseData,
//       isCompleteProfile: true,
//       photos: (parseData?.photos || images)
//         ? [...(parseData?.photos || []), ...(images || [])]?.map((item) => {
//             if (typeof item === "object" && item?.url) {
//               return item;
//             }
//             return { url: item };
//           })
//         : [], // Default to an empty array if neither photos nor images exist
//     },
    
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       phone: true,
//       gender: true,
//       dob: true,
//       sexOrientation: true,
//       education: true,
//       interests: true,
//       distance: true,
//       favoritesFood: true,
//       photos: true,
//       about: true,
//       lat: true,
//       long: true,
//       isCompleteProfile: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

  
//   return result;
//  } catch (error:any) {
//   throw new ApiError(httpStatus.NOT_ACCEPTABLE,error.message)
//  }
// };

// update user data into database by id for admin
const updateUserIntoDb = async (payload: IUser, id: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);

  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: payload,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    );

  return result;
};

// get random user

const getRandomUser = async () => {
  // Get the total count of users
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    return null; // Return null if no users exist
  }

  // Generate a random offset within the user count
  const randomOffset = Math.floor(Math.random() * userCount);

  // Fetch a random user using the offset
  const randomUser = await prisma.user.findMany({
    take: 1,
    skip: randomOffset,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return randomUser.length > 0 ? randomUser[0] : null;
};

// get user for home page with pagination

// const getUserForHomePage = async (
//   authUserId: string,
//   page: number = 1,
//   limit: number = 20,
//   sortBy: string = "createdAt",
//   sortOrder: string = "asc"
// ) => {
//   const offset = (page - 1) * limit;

//   const authUser = await prisma.user.findUnique({
//     where: { id: authUserId },
//     select: {
//       lat: true,
//       long: true,
//       distance: true,
//       favoritesFood: true,
//       interest: true,
//       photos: true,
//       about: true,
//     },
//   });

//   if (!authUser?.lat || !authUser?.long || !authUser?.distance) {
//     throw new Error("Authenticated user's location or radius is not available");
//   }

//   const authLat = parseFloat(authUser.lat);
//   const authLong = parseFloat(authUser.long);
//   const maxRadius = parseFloat(authUser.distance);

//   const users = await prisma.user.findMany({
//     where: {
//       AND: [
//         { id: { not: authUserId } },
//         { lat: { not: null }, long: { not: null } },
//         {
//           OR: [
//             { favoritesFood: { hasSome: authUser.favoritesFood || [] } },
//             { interest: { hasSome: authUser.interest || [] } },
//           ],
//         },
//       ],
//     },
//     select: {
//       id: true,
//       email: true,
//       gender: true,
//       ethnicity: true,
//       dob: true,
//       role: true,
//       name: true,
//       favoritesFood: true,
//       photos: true,
//       interest: true,
//       lat: true,
//       long: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   const filteredUsers = users
//     .map((user) => {
//       if (!user.lat || !user.long || !user.dob) return null;

//       const userLat = parseFloat(user.lat);
//       const userLong = parseFloat(user.long);

//       const distance = calculateDistance(authLat, authLong, userLat, userLong);

//       if (distance <= maxRadius) {
//         const age = calculateAge(user.dob); // Calculate age
//         return { ...user , distance: `${distance.toFixed(1)} km`, age }; // Add age to user object
//       }
//       return null;
//     })
//     .filter((user) => user !== null)
//     .slice(offset, offset + limit);

//   const totalUsers = filteredUsers.length;
//   const totalPages = Math.ceil(totalUsers / limit);

//   return {
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalUsers,
//       limit,
//     },
//     users: filteredUsers,
//   };
// };


const getUserForHomePage = async (
  authUserId: string,
  page: number = 1,
  limit: number = 20,
  sortBy: string = "createdAt",
  sortOrder: string = "asc"
) => {
  const offset = (page - 1) * limit;

  // Fetch authenticated user's details
  const authUser = await prisma.user.findUnique({
    where: { id: authUserId },
    select: {
      lat: true,
      long: true,
      gender:true,
      distance: true,
      favoritesFood: true,
      interests: true,
      photos: true,
      about: true,
      sexOrientation: true, // Fetching the sexOrientation field
    },
  });

  if (!authUser?.lat || !authUser?.long || !authUser?.distance) {
    throw new Error("Authenticated user's location or radius is not available");
  }

  const authLat = parseFloat(authUser.lat);
  const authLong = parseFloat(authUser.long);
  const maxRadius = parseFloat(authUser.distance);

  // Define gender filter logic based on sexOrientation
  let genderFilter: any = {};
  if (authUser?.sexOrientation === "Girl") {
    genderFilter = { gender: "Girl" };
  } else if (authUser?.sexOrientation === "Boy") {
    genderFilter = { gender: "Boy" };
  } // If "Both", do not filter by gender

  // Fetch users with the gender filter applied
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: authUserId },gender: { not: authUser.gender} },
        { lat: { not: null }, long: { not: null } },
        {
          OR: [
            { favoritesFood: { hasSome: authUser.favoritesFood || [] } },
            { interest: { hasSome: authUser.interests || [] } },
          ],
        },
        genderFilter, // Apply gender filter
      ],
    },
    select: {
      id: true,
      email: true,
      gender: true,
      dob: true,
      role: true,
      name: true,
      favoritesFood: true,
      photos: true,
      interests: true,
      lat: true,
      long: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Filter users by distance and calculate additional fields
  const filteredUsers = users
    .map((user) => {
      if (!user.lat || !user.long || !user.dob) return null;

      const userLat = parseFloat(user.lat);
      const userLong = parseFloat(user.long);

      const distance = calculateDistance(authLat, authLong, userLat, userLong);

      if (distance <= maxRadius) {
        const age = calculateAge(user.dob); // Calculate age
        return { ...user, distance: `${distance.toFixed(1)} miles`, age }; // Add age to user object
      }
      return null;
    })
    .filter((user) => user !== null);

  // If no users are found within the distance, show all users from the world
  if (filteredUsers.length === 0) {
    const allUsers = await prisma.user.findMany({
      where: {
       AND:[ {id: { not: authUserId }}]
      },
      select: {
        id: true,
        email: true,
        gender: true,
        dob: true,
        role: true,
        name: true,
        favoritesFood: true,
        photos: true,
        interests: true,
        lat: true,
        long: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const allFilteredUsers = allUsers
      .map((user) => {
        if (!user.lat || !user.long || !user.dob) return null;
        const age = calculateAge(user.dob); // Calculate age
        return { ...user, age }; // Add age to user object
      })
      .filter((user) => user !== null);

    return {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allFilteredUsers.length / limit),
        totalUsers: allFilteredUsers.length,
        limit,
      },
      users: allFilteredUsers.slice(offset, offset + limit),
    };
  }

  // Pagination for the filtered users (within the distance)
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      limit,
    },
    users: filteredUsers.slice(offset, offset + limit),
  };
};


// Helper function to calculate the distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const EARTH_RADIUS = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// get single user by id 
const getSingleUserById = async (id:string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      gender: true,
      dob: true,
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
  let age
if(user?.dob){
   age= calculateAge(user.dob)
}

  return { ...user, age };
}
export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  // updateProfile,
  updateUserIntoDb,
  getRandomUser,
  getUserForHomePage,
  getSingleUserById,
  checkEmail,
  checkUsername,
  updateGenderVisibility
};
