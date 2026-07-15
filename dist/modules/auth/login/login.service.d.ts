import type { PUser } from "./login.interface";
export declare const loginService: {
    loginUserIntoDB: (payLoad: PUser) => Promise<{
        token: string;
        user: any;
    }>;
};
//# sourceMappingURL=login.service.d.ts.map