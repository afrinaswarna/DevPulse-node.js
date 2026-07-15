import { userService } from "./user.service";
const getAllUser = async (req, res) => {
    try {
        const result = await userService.getAllUserFromDB();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        });
    }
};
export const userController = {
    getAllUser
};
//# sourceMappingURL=user.controller.js.map