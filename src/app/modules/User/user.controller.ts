  import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/ApiResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";
import { User } from "@prisma/client";


const checkEmail = catchAsync(async (req:Request, res: Response) =>{
  console.log("check email")
  const result = await userService.checkEmail(req.body)
  sendResponse(res, {
    statusCode:httpStatus.OK,
    success:true,
    message:"Email checked",
    data:result
  })
})

const checkUsername = catchAsync (async (req:Request, res:Response)=>{
  const result = await userService.checkUsername(req.body)
  sendResponse(res,{
    statusCode:httpStatus.OK,
    success:true,
    message:"Username checked",
    data:result
  })
})

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered successfully!",
    data: result,
  });
});



// get all user form db
const getUsers = catchAsync(async (req: Request, res: Response) => {

  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await userService.getUsersFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});


// get all user form db
// const updateProfile = catchAsync(async (req: Request & {user?:any}, res: Response) => {
//   const user = req?.user;

//   const result = await userService.updateProfile(req);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Profile updated successfully!",
//     data: result,
//   });
// });

// const potentialMatches = await prisma.user.findMany({
//   where: {
//     id: { not: currentUser.id },
//     deleted: false,
//     status: 'ACTIVE',
//     genderVisibility: true,
//     interests: {
//       hasSome: currentUser.interests,
//     },
//     trip_country: currentUser.trip_country,
//     trip_continent: currentUser.trip_continent,
//   },
//   select: {
//     id: true,
//     username: true,
//     interests: true,
//     tripType: true,
//     tripDuration: true,
//     trip_country: true,
//     trip_continent: true,
//     budgetMin: true,
//     budgetMax: true,
//     interestAgeGroup: true,
//   }
// });

// // Score & sort in memory
// const scoredMatches = potentialMatches.map(user => {
//   let score = 0;
//   if (user.tripType === currentUser.tripType) score++;
//   if (user.tripDuration === currentUser.tripDuration) score++;
//   if (user.interestAgeGroup === currentUser.interestAgeGroup) score++;

//   const sharedInterests = currentUser.interests.filter(i => user.interests.includes(i));
//   score += sharedInterests.length;

//   const budgetOverlap =
//     (user.budgetMin ?? 0) <= (currentUser.budgetMax ?? 999999) &&
//     (user.budgetMax ?? 999999) >= (currentUser.budgetMin ?? 0);
//   if (budgetOverlap) score++;

//   return { ...user, score };
// }).sort((a, b) => b.score - a.score);

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export const getMatchingUsers = async (req, res) => {
//   const userId = req.user.id; // Assuming you get this from JWT or session

//   try {
//     const currentUser = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!currentUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const matches = await prisma.user.findMany({
//       where: {
//         id: { not: userId }, // Exclude self
//         deleted: false,
//         status: 'ACTIVE', // Only show active users
//         genderVisibility: true, // Only show users who want to be seen
//         tripType: currentUser.tripType,
//         tripDuration: currentUser.tripDuration,
//         trip_continent: currentUser.trip_continent,
//         trip_country: currentUser.trip_country,
//         interestAgeGroup: currentUser.interestAgeGroup,
//         interests: {
//           hasSome: currentUser.interests, // At least one interest in common
//         },
//         budgetMin: {
//           lte: currentUser.budgetMax ?? 999999,
//         },
//         budgetMax: {
//           gte: currentUser.budgetMin ?? 0,
//         },
//       },
//       select: {
//         id: true,
//         username: true,
//         firstName: true,
//         lastName: true,
//         gender: true,
//         interests: true,
//         tripType: true,
//         tripDuration: true,
//         trip_continent: true,
//         trip_country: true,
//         budgetMin: true,
//         budgetMax: true,
//       },
//     });

//     return res.status(200).json(matches);
//   } catch (err) {
//     console.error('Error fetching matches:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

const getMatchingUsers = catchAsync(async (req:Request, res:Response)=>{

})

const getMyProfile = catchAsync(async (req:Request, res:Response)=>{
  
})



// *! update user role and account status
const updateUser = catchAsync(async (req: Request, res: Response) => {
const id = req.params.id;
  const result = await userService.updateUserIntoDb( req.body,id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});
// *! update user role and account status
const getRandomUser = catchAsync(async (req: Request, res: Response) => {
const id = req.params.id;
  const result = await userService.getRandomUser();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "get random user  successfully!",
    data: result,
  });
});
// *! update user role and account status
const getSingleUserById = catchAsync(async (req: Request, res: Response) => {
  console.log(req.path)
const id = req.params.id;
  const result = await userService.getSingleUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "get random user  successfully!",
    data: result,
  });
});
// Controller for fetching users for the home page
const getUserForHomePage = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.body; // Extract authenticated user's ID from request (assuming middleware sets req.user)
  const page = parseInt(req.query.page as string) || 1; // Default page 1
  const limit = parseInt(req.query.limit as string) || 20; // Default limit 20
  const sortBy = (req.query.sortBy as string) || "createdAt"; // Default sorting by "createdAt"
  const sortOrder = (req.query.sortOrder as string) || "asc"; // Default sorting order ascending

  const result = await userService.getUserForHomePage(authUserId, page, limit, sortBy, sortOrder);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully for the home page.",
    data: result,
  });
});


export const userController = {
  createUser,
  getUsers,
  // updateProfile,
  updateUser,
  getRandomUser,
  getUserForHomePage,
  getSingleUserById,
  checkEmail,
  checkUsername
};
