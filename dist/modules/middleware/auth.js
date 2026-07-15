import jwt, {} from 'jsonwebtoken';
import config from '../../config';
import { pool } from '../../db';
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const decodedToken = jwt.verify(token, config.secret);
            const userDataFromDB = await pool.query(`
           SELECT * FROM users WHERE email=$1 
            `, [decodedToken.email]);
            const user = userDataFromDB.rows[0];
            if (userDataFromDB.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            if (roles.length && !roles.includes(user.role)) {
                res.status(403).json({
                    success: false,
                    message: "Forbidden"
                });
            }
            req.user = decodedToken;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export default auth;
//# sourceMappingURL=auth.js.map