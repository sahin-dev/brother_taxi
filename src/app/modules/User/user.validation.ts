import { InterestType } from "@prisma/client";
import { z } from "zod";

const CreateUserValidationSchema = z.object({
  phone:z.string(),
  email:z.string().email().nonempty("Email is required"),
  username: z.string().nonempty("Username is required"),
  dob:z.date({required_error:"Date of birth is required"}),
  birth_country:z.string().nonempty("country is required"),
  gender: z.string().nonempty("Gender is required"),
  interest:z.string().nonempty("Interest is required"),
  trip_type:z.string().nonempty("Trip type is required"),
  trip_duration:z.string(),
  continent:z.string().nonempty("Continent is required"),
  trip_country:z.string().nonempty("Trip country is requred"),
  age_range:z.string().nonempty("Age range is required"),
  interests:z.nativeEnum(InterestType),
  budget:z.object({max:z.number({required_error:"Max must be provided"}), min:z.number({required_error:"Min must be provided"})}),
  about:z.string().nonempty("About must be provided")

});

export { CreateUserValidationSchema };
const UserLoginValidationSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
});

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  promoCode: z.string().optional(),
  profession: z.string().optional(),
});

export const UserValidation = {
  CreateUserValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
};
