import type { Request, Response } from "express";
import { signupService } from "./signup.service";
import sendResponse from "../../../utility/sendResponse";

const registerUser = async(req:Request,res:Response)=>{
    try {
        const result = await signupService.registerUserIntoDB(req.body)
       
        sendResponse(res,{
            statusCode:201,
            success:true,
            message:"User registered successfully",
            data:result.rows[0]
        })
    } catch (error:any) {
        
        sendResponse(res,{
            statusCode:500,
            success:false,
            message:error.message,
            error:error
        })
    }

}

export const signupController = {
    registerUser
}