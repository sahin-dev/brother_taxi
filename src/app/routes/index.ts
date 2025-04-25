import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.route";

const router = Router()

const moduleRoutes = [
    {path:'/auth',route:AuthRoutes},
    {path:'/user', route:userRoutes}
]

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router