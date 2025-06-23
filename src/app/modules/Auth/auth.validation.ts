import { UserRole } from '@prisma/client'
import {z} from 'zod'

export const loginValidationSchema = z.object({
    countryCode:z.string({required_error:"countryCode is required"}),
    phone:z.string({required_error:"phone is required"}),
    role:z.nativeEnum(UserRole, {invalid_type_error:"Invalid role"}),
    otp:z.string().optional(),
    fcmToken: z.string().optional()

})