import { loginService } from "./login.service";
import sendResponse from "../../../utility/sendResponse";
const loginUser = async (req, res) => {
    try {
        const result = await loginService.loginUserIntoDB(req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};
export const loginController = {
    loginUser,
};
//# sourceMappingURL=login.controller.js.map