import {z} from 'zod'

const createTripSchema = z.object
({
  name: z.string().nonempty("Trip name is required"),
  description: z.string().optional(),
  location: z.object({
    latitude: z.number({required_error: "Latitude is required"}),
    longitude: z.number({required_error: "Longitude is required"}),
  }),
 images: z.array(z.string()).optional(),
});

export const tripValidation = {
  createTripSchema,
}