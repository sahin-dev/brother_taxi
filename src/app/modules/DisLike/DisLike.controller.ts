
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/ApiResponse";
import { disLikeService } from "./DisLike.service";


const toggleDislike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await disLikeService.toggleDisLike(id, user);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Dislike toggled successfully",
    data: result,
  });
});

const getAllMyDislikeIds = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await disLikeService.getAllMydisLikeIds(user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Fetched all disliked user IDs successfully",
    data: result,
  });
});

export const dislikeController = {
  toggleDislike,
  getAllMyDislikeIds,
};
