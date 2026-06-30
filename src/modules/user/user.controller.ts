import type { Request, Response } from "express";
import { userService } from "./user.service";

const getAllUser = async(req:Request,res:Response)=>{
    
    try {
     const result= await  userService.getAllUserFromDB() 
      res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:result.rows
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:error.message,
            error:error
        })
        
    }
}

export const userController = {
    getAllUser
}