 import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectdb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from 'cors'
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"

import path from "path";
const __dirname = path.resolve();

 const app= express()
 app.use(cors({
   origin:"http://localhost:5173",
   credentials:true
 }))
 connectdb()
 const port = process.env.PORT || 5000
 app.use(express.json())
 app.use(cookieParser())
 app.use("/api/auth",authRouter)
 app.use("/api/user",userRouter)

 if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

}

//  app.get("/",(req , res) => {
//     res.send("working")
//  })

 app.listen(port,()=> {
    
    console.log("server started");
    
 })

