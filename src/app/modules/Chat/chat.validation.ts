import { z } from 'zod';

const chatSchema = z.object({
  receiverId: z.string(),
  message: z.string()
});



export const chatValidation = {
    chatSchema
}