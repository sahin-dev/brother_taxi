
import z from 'zod'

export const UserLoginValidationSchema = z.object({
    phone: z.string().nonempty("Name is required"),
    otp: z.number({required_error:"Otp is required"}).positive({message:"Otp must be a positive number"})
 
  });
  
  
export const changePasswordValidationSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });
  
  export const verifyPhoneSchema = z.object({phone:z.string()})

  export const changePhoneNumberSchema = z.object({
    newPhone: z.string({required_error:"New phone  number is required."})
  })

  export const loginAttemptSchema = z.object({
    phone: z.string().nonempty("Name is required"),
 
  })