import bcrypt from "bcryptjs";
import { pool } from "../../../db";
import jwt from "jsonwebtoken";
import config from "../../../config";
const loginUserIntoDB = async (payLoad) => {
    const { email, password } = payLoad;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);
    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!! Please register");
    }
    const user = userData.rows[0];
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
        throw new Error("Invalid Credentials!! Please register");
    }
    const jwtPayLoad = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const token = jwt.sign(jwtPayLoad, config.secret, {
        expiresIn: '1d'
    });
    delete user.password;
    return { token, user };
};
export const loginService = {
    loginUserIntoDB
};
//# sourceMappingURL=login.service.js.map