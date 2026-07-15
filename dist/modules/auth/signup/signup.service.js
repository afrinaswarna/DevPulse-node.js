import bcrypt from "bcryptjs";
import { pool } from "../../../db";
const registerUserIntoDB = async (payLoad) => {
    const { name, email, password, role } = payLoad;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
        INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `, [name, email, hashPassword, role]);
    delete result.rows[0].password;
    console.log(result);
    return result;
};
export const signupService = {
    registerUserIntoDB
};
//# sourceMappingURL=signup.service.js.map