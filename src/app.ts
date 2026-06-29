import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { signupRoute } from "./modules/auth/signup/signup.router";

const app: Application = express();

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});


app.use('/api/auth',signupRoute)
export default app;