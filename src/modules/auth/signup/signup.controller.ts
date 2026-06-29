import type { Request, Response } from "express";
import { signupService } from "./signup.service";

const registerUser = async(req:Request,res:Response)=>{
    try {
        const result = await signupService.registerUserIntoDB(req.body)
        res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:result
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:error.message,
            error:error
        })
    }

}

export const signupController = {
    registerUser
}