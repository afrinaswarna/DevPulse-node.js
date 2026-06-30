import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { signupRoute } from "./modules/auth/signup/signup.router";
import { loginRoute } from "./modules/auth/login/login.route";
import { userRoute } from "./modules/user/user.router";

const app: Application = express();

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});


app.use('/api/auth',signupRoute)
app.use('/api/auth',loginRoute)
app.use('/api/users',userRoute)



export default app;