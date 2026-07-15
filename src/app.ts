import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { signupRoute } from "./modules/auth/signup/signup.router";
import { loginRoute } from "./modules/auth/login/login.route";

import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors"
import globalErrorHandler from "./modules/middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());


const corsOptions = {
  origin: 'http://localhost:3000',
  
}

app.use(cors(corsOptions ))




app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
    author: "Afrina Swarna",
  });
});


app.use('/api/auth',signupRoute)
app.use('/api/auth',loginRoute)

app.use('/api/issues',issuesRoute)

// Global Error Handling Middleware
app.use(globalErrorHandler)



export default app;