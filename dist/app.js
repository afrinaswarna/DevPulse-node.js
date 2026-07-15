import express, {} from "express";
import { signupRoute } from "./modules/auth/signup/signup.router";
import { loginRoute } from "./modules/auth/login/login.route";
import { userRoute } from "./modules/user/user.router";
import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors";
import globalErrorHandler from "./modules/middleware/globalErrorHandler";
const app = express();
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use('/api/auth', signupRoute);
app.use('/api/auth', loginRoute);
app.use('/api/users', userRoute);
app.use('/api/issues', issuesRoute);
// Global Error Handling Middleware
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map