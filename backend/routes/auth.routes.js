 import express from "express"
import { Login, logout, signup } from "../controllers/auth.controller.js"



 const authRouter = express.Router()

authRouter.post("/signup", signup )
authRouter.post("/signin", Login)
authRouter.get("/logout",logout)

 export default authRouter