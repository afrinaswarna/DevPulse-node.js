import { issuesService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";
const createIssues = async (req, res) => {
    const user = req.user;
    const result = await issuesService.createIssuesIntoDB(req.body, user);
    try {
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result.rows[0],
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
const getAllIssues = async (req, res) => {
    try {
        const result = await issuesService.getAllIssuesFromDB(req.query);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully",
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
const getSingleIssue = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await issuesService.getSingleIssueFromDB(id);
        if (!result) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
            });
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue retrieved successfully",
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
const updateIssue = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const result = await issuesService.updateIssueIntoDB(req.body, id, user);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues updated successfully",
            data: result.rows[0],
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
const deleteIssus = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    // console.log(user);
    try {
        const result = await issuesService.deleteIssueFromDB(id, user);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues deleted successfully",
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
export const issuesController = {
    createIssues,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssus,
};
//# sourceMappingURL=issues.controller.js.map