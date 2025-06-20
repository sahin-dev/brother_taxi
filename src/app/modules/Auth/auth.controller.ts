import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from 'express'
import { loginUserIntoDB } from "./auth.service";
import sendResponse from "../../../shared/ApiResponse";


export const userLogin  = catchAsync(async (req:Request, res:Response)=>{
    const payload = req.body

    const result = await loginUserIntoDB(payload)

    sendResponse(res, {
        success:true,
        statusCode:httpStatus.OK,
        message:"User authenticated",
        data:result
    })
})