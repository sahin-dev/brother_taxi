import { UserRole } from "@prisma/client";

export interface IUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  profession:string;
  promoCode:string;
  isDeleted:boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  distanceRange?: number | undefined;
}