import { UserRole } from "@prisma/client";
import { boolean } from "zod";

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

export interface IUpdateGenderVisibility {
  id:string
}

export interface IUserUpdate {
  email?:string,
  firstName?:string,
  lastName?:string,
  phone?:string,
  role?:string,
  isDeleted?:boolean
}