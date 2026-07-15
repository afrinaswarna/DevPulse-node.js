import type { JwtPayload } from "jsonwebtoken";
import type { issuePayLoad } from "./issues.interface";
export declare const issuesService: {
    createIssuesIntoDB: (payLoad: issuePayLoad, user: JwtPayload) => Promise<import("pg").QueryResult<any>>;
    getAllIssuesFromDB: (queryParams: {
        sort?: string;
        type?: string;
        status?: string;
    }) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }[] | undefined>;
    getSingleIssueFromDB: (id: string) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }>;
    updateIssueIntoDB: (payLoad: issuePayLoad, id: string, user: JwtPayload) => Promise<import("pg").QueryResult<any>>;
    deleteIssueFromDB: (id: string, user: JwtPayload) => Promise<import("pg").QueryResult<any>>;
};
//# sourceMappingURL=issues.service.d.ts.map