import type { Request, Response } from "express";
import { issuesService } from "./issues.service";


const createIssues = async (req: Request, res: Response) => {
  const user = req.user;
  const result = await issuesService.createIssuesIntoDB(req.body, user);
  try {
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issuesService.getSingleIssueFromDB(id as string);
    // console.log(result);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async(req:Request,res:Response)=>{
    const {id} = req.params
    const user = req.user
    try {
        const result = await issuesService.updateIssueIntoDB(req.body,id as string,user)
        // console.log("controller",result);

         res.status(201).json({
      success: true,
      message: "Issues updated successfully",
      data: result.rows[0]
    });

        
    } catch (error:any) {
        res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
        
    }
}
export const issuesController = {
  createIssues,
  getSingleIssue,
  updateIssue
};
