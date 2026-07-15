import { Router } from "express";
import { signupController } from "./signup.controller";
const router = Router();
router.post('/signup', signupController.registerUser);
export const signupRoute = router;
//# sourceMappingURL=signup.router.js.map