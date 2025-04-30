
import { RequestType } from '@prisma/client';
import z from 'zod'

export const UserLoginValidationSchema = z.object({
    phone: z.string().nonempty("Name is required").optional(),
    otp: z.string({required_error:"Otp is required"}).optional(),
    fcmtoken:z.string().optional(),
    provider:z.string().optional(),
    appleId:z.string().optional()
 
  });
  
  
export const changePasswordValidationSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });
  
  // export const verifyPhoneSchema = z.object({phone:z.string()})

  export const changePhoneNumberSchema = z.object({
    newPhone: z.string({required_error:"New phone  number is required."})
  })

  export const loginAttemptSchema = z.object({
    phone: z.string().nonempty("Name is required"),
 
  })

  export const verifyPhoneSchema = z.object({
    phone:z.string().nonempty("Phone is required"),
    requestType:z.nativeEnum(RequestType,{required_error:"requestType is required"})
  })

  export const verifyRequestSchema =  z.object({
    phone:z.string().nonempty("phone is required"),
    otp:z.string().nonempty("otp is required"),
    requestType:z.nativeEnum(RequestType,{required_error:"Request type is required"}),
    newPhone:z.string({invalid_type_error:"phone is invalid"}).optional(),
    fcmToken:z.string().optional()
  })