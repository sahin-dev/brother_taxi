import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { JwtPayload } from "jsonwebtoken";

const toggleDisLike = async (id: string, user: any) => {
  const prismaTransaction = await prisma.$transaction(async (prisma) => {
    // Check if the user exists
    const isUserExist = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Check if the disLike already exists
    const existingDisLike = await prisma.disLike.findFirst({
      where: {
        senderId: user.id,
        receiverId: id,
      },
    });
    const existingLike = await prisma.like.findFirst({
      where: {
        senderId: user.id,
        receiverId: id,
      },
    });
    const existingSuperLike = await prisma.superLike.findFirst({
      where: {
        senderId: user.id,
        receiverId: id,
      },
    });
    if (existingLike) {
    console.log("delete like")
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    }
    if (existingSuperLike) {
    console.log("delete superlike")
      await prisma.superLike.delete({
        where: { id: existingSuperLike.id },
      });
    }

    let result;
    if (existingDisLike) {
      // Remove the disLike if it exists
      const deleteDislike= await prisma.disLike.delete({
        where: { id: existingDisLike.id },
      });
      result={
        message: "Dislike removed successfully",
        dislike: deleteDislike,
      }
    } else {
      // Add the disLike if it doesn't exist
      const addDisLike = await prisma.disLike.create({
        data: {
          senderId: user.id,
          receiverId: id,
        },
      });
      result={
        message: "Dislike added successfully",
        dislike: addDisLike,
      }
    }

    return result;
  });

  return prismaTransaction;
};

const getAllMydisLikeIds = async (user: JwtPayload) => {
  const findUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.disLike.findMany({
    where: { senderId: user.id },
    select: { receiverId: true },
  });

  return result.map((item) => item.receiverId);
};

export const disLikeService = {
  toggleDisLike,
  getAllMydisLikeIds,
};
