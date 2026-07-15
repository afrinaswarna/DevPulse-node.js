import type { Request, Response } from "express";
import { loginService } from "./login.service";
import sendResponse from "../../../utility/sendResponse";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await loginService.loginUserIntoDB(req.body);

    

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success: false,
      message: error.message,
      error: error,
    })
    
  }
};

export const loginController = {
  loginUser,
};
