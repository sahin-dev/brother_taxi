import { GenderLabel, GenderSubCategory, InterestType, TripDuration, TripType } from "@prisma/client";
import { z } from "zod";

const CreateUserValidationSchema = z.object({
  phone:z.string().optional(),
  email:z.string().email().optional(),
  username: z.string().nonempty("Username is required"),
  dob:z.string({required_error:"Date of birth is required"}),
  residence_country:z.string().nonempty("country is required"),
  gender: z.nativeEnum(GenderLabel),
  gender_sub_categories:z.array(z.nativeEnum(GenderSubCategory)).optional(),
  tripType:z.nativeEnum(TripType),
  tripDuration:z.nativeEnum(TripDuration),
  tripContinent:z.string().nonempty("Continent is required"),
  tripCountry:z.string().nonempty("Trip country is requred"),
  interestAgeGroup:z.string().nonempty("Age range is required"),
  interests:z.array(z.nativeEnum(InterestType)),
  budgetMax:z.number({required_error:"budget max is required"}),
  budgetMin:z.number({required_error:"Budget min is required"}),
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

// id                String         @id @default(auto()) @map("_id") @db.ObjectId
//   email             String?         
//   phone             String?         @unique
//   username          String?         
//   dob               DateTime?
//   residence_country String?
//   firstName         String?
//   lastName          String?
//   about             String?
//   interests         InterestType[]
//            Int?
//   budgbudgetMinetMax         Int?
//   travelPartner     TravelPartner?
//   deleted           Boolean @default(false)

//   gender            GenderDescription?
//   genderVisibility  Boolean?        @default(false)
//   tripType          TripType?
//   tripDuration      TripDuration?
//   tripContinent  String?
//   tripCountry String?
//   interestAgeGroup  AgeGroup?
//   otp            String?
//   otpExpiresIn   DateTime?

const userUpdateSchema = z.object({

  email:z.string().email().optional(),
  username: z.string().optional(),
  firstName:z.string().optional(),
  lastName:z.string().optional(),
  dob:z.string({required_error:"Date of birth is required"}).optional(),
  residence_country:z.string().nonempty("country is required").optional(),
  gender: z.object({label:z.string().nonempty("Label is required"), sub_categories:z.array(z.nativeEnum(GenderSubCategory)).optional()}).optional(),
  tripType:z.nativeEnum(TripType).optional(),
  tripDuration:z.nativeEnum(TripDuration).optional(),
  tripContinent:z.string().nonempty("Continent is required").optional(),
  tripCountry:z.string().nonempty("Trip country is requred").optional(),
  interestAgeGroup:z.string().nonempty("Age range is required").optional(),
  interests:z.array(z.nativeEnum(InterestType)).optional(),
  budgetMax:z.number({required_error:"budget max is required"}).optional(),
  budgetMin:z.number({required_error:"Budget min is required"}).optional(),
  about:z.string().nonempty("About must be provided").optional()

});

const checkEmailSchema = z.object({
  email:z.string().email("Email invalid").nonempty("email is required")
})

const verifySetPhoneSchema = z.object({
  
  otp:z.string().nonempty("Otp is required"),
  newPhone:z.string().nonempty("New phone number is required")  
})


const setUsernameSchema = z.object({
  username:z.string().nonempty("Username is required")
})
export const UserValidation = {
  checkEmailSchema,
  CreateUserValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
  setUsernameSchema,
};


