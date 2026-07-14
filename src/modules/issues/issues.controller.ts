import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import type { JwtPayload } from "jsonwebtoken";

const createIssues = async (req: Request, res: Response) => {
  const user = req.user;
  const result = await issuesService.createIssuesIntoDB(req.body, user as JwtPayload);
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
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
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
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issuesService.getSingleIssueFromDB(id as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
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

const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const result = await issuesService.updateIssueIntoDB(
      req.body,
      id as string,
      user as JwtPayload
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
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

const deleteIssus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  // console.log(user);
  try {
    const result = await issuesService.deleteIssueFromDB(id as string, user as JwtPayload);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssus,
};
