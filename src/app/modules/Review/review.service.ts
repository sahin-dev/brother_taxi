import prisma from "../../../shared/prisma"


export const provideReview = async (userId:string, text:string, rating:number, recieverId:string)=>{

    const createdReview = await prisma.review.create({data:{
        rating,
        text,
        reciever_id:recieverId,
        reviewer_id:userId
    }})

    return createdReview
}


export const getMyFeedback = async (userId:string)=>{

    const myFeedback = await prisma.review.findMany({where:{reciever_id:userId}, include:{reviewer:true}})

    return myFeedback
}