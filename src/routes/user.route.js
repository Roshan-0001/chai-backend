import { Router  } from "express";
import { registerUser } from "../controllers/users.controllrs.js";

const router = Router()

router.route("/register").post(registerUser)


export default router