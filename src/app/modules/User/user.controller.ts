  import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/ApiResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";
import { User } from "@prisma/client";
import ApiError from "../../../errors/ApiError";
import { generateOtp } from "../../../helpers/generateOtp";
import prisma from "../../../shared/prisma";


const setUserPhone =  catchAsync(async (req:Request, res:Response)=>{
  const result = await userService.setUserPhone(req.user.id, req.body)
  

  sendResponse(res,{
    statusCode:httpStatus.OK,
    success:true,
    message:"Otp sent",
    data:result
  })
})


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
  checkUsername,
  setUserPhone
};
