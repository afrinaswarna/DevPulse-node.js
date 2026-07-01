import type { Request, Response } from "express";
import { issuesService } from "./issues.service";


const createIssues = async(req:Request,res:Response)=>{
    // try {

        

    //      res.status(201).json({
    //         success:true,
    //         message:"Issue created successfully",
    //         data:result
    // } )}catch (error:any) {
    //     res.status(500).json({
    //         success:false,
    //         message:error.message,
    //         error:error
    //     })
    // }
}

export const issuesController={
    createIssues
}