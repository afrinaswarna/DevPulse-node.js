import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router()

router.get('/',auth(USER_ROLE.contributor,USER_ROLE.maintainer),userController.getAllUser)

export const userRoute = router;