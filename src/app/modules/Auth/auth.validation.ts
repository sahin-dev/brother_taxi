
import { RequestType } from '@prisma/client';
import z from 'zod'

export const UserLoginValidationSchema = z.object({
    phone: z.string().nonempty("Name is required").optional(),
    otp: z.string({required_error:"Otp is required"}).optional(),
    fcmtoken:z.string().optional(),
    provider:z.string().optional(),
    appleId:z.string().optional()
 
  });
  
export const verifyWithEmailSchema = z.object({
    email: z.string().email("Email is required"),
    requestType:z.nativeEnum(RequestType,{required_error:"Request type is required"}),
}) 


export const verifyRequestWithEmailSchema =  z.object({
  email:z.string().email().nonempty("phone is required"),
  otp:z.string().nonempty("otp is required").optional(),
  requestType:z.nativeEnum(RequestType,{required_error:"Request type is required"}),
  newPhone:z.string({invalid_type_error:"phone is invalid"}).optional(),
  fcmToken:z.string().optional()
})
  
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

  
export const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  method: z.enum(["email", "phone"]),
  requestType: z.nativeEnum(RequestType)
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  requestType: z.nativeEnum(RequestType),
  method: z.enum(["email", "phone"]),
  newPhone: z.string().optional(),
  fcmToken: z.string().optional()
});