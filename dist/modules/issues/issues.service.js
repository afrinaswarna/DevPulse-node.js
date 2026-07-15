import { pool } from "../../db";
const createIssuesIntoDB = async (payLoad, user) => {
    const { title, description, type, status } = payLoad;
    const { id } = user;
    try {
        const result = await pool.query(`
            INSERT INTO issues (title,description,type,status,reporter_id) VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
            `, [title, description, type, status, id]);
        return result;
    }
    catch (error) {
        throw new Error("You have already created an issue with this exact title.");
    }
};
const getAllIssuesFromDB = async (queryParams) => {
    const { sort, type, status } = queryParams;
    const queryValue = [];
    const whereConditions = [];
    if (type) {
        queryValue.push(type);
        whereConditions.push(`type = $${queryValue.length}`);
    }
    if (status) {
        queryValue.push(status);
        whereConditions.push(`status = $${queryValue.length}`);
    }
    let queryText = `SELECT * FROM issues`;
    if (whereConditions.length > 0) {
        queryText += ` WHERE ` + whereConditions.join(" AND ");
    }
    let orderByClause = " ORDER BY created_at DESC";
    if (sort === "oldest") {
        orderByClause = " ORDER BY created_at ASC";
    }
    queryText += orderByClause;
    const result = await pool.query(queryText, queryValue);
    const issues = result.rows;
    if (issues.length === 0) {
        return [];
    }
    // extract unique reporter IDs  from the  fetched issues
    const reporterIds = [
        ...new Set(issues.map((issue) => issue.reporter_id).filter(Boolean)),
    ];
    let userMap = {};
    if (reporterIds.length > 0) {
        // batch fetch all unique users in ONE query using `=ANY ($1)`
        const userQueryText = `
        SELECT id, name, role FROM users WHERE id = ANY($1)
        `;
        const userResult = await pool.query(userQueryText, [reporterIds]);
        // convert the array of users into an object/map for quick 0(1) lookups
        userMap = userResult.rows.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
        // userMap = {
        //               1: {id:1,name:"afrina",role:"maintainer"},
        //               2: {id:2,name:"swarna2",role:"contributor"},
        //               3:  {id:3,name:"swarna3",role:"contributor"}
        //            }
        const formattedIssues = issues.map((issue) => {
            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                //attach the matched reporter object, or null if not found
                reporter: userMap[issue.reporter_id] || null, // userMap[1] = {id:1,name:"afrina",role:"maintainer"}
                created_at: issue.created_at,
                updated_at: issue.updated_at,
            };
        });
        return formattedIssues;
    }
};
const getSingleIssueFromDB = async (id) => {
    const issueResult = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id]);
    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found");
    }
    const issue = issueResult.rows[0];
    const reporterId = issue.reporter_id;
    const userResult = await pool.query(`
    SELECT id, name, role FROM users WHERE id=$1
    
    `, [reporterId]);
    const reporter = userResult.rows[0] || null;
    const formattedIssue = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
    return formattedIssue;
};
const updateIssueIntoDB = async (payLoad, id, user) => {
    const { title, description, type } = payLoad;
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
        id,
    ]);
    const issue = issueResult.rows[0];
    if (!issue) {
        throw new Error("Issue not found");
    }
    const reporterId = issue.reporter_id;
    const currentStatus = issue.status;
    const isMaintainer = user.role === "maintainer";
    const isOwner = reporterId === user.id;
    const isOpen = currentStatus === "open";
    if (isMaintainer || (user.role === "contributor" && isOwner && isOpen)) {
        let nextStatus = currentStatus;
        if (isMaintainer) {
            if (currentStatus === "open") {
                nextStatus = "in_progress";
            }
            else if (currentStatus === "in_progress") {
                nextStatus = "resolved";
            }
            else if (currentStatus === "resolved") {
                throw new Error("Cannot update an issue that is already resolved");
            }
        }
        const result = await pool.query(`
            UPDATE issues SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status),
                updated_at = NOW() 
            WHERE id = $5 
            RETURNING *
        `, [title, description, type, nextStatus, id]);
        return result;
    }
    else {
        throw new Error("Unauthorized to update this issue");
    }
};
const deleteIssueFromDB = async (id, user) => {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
        id,
    ]);
    const issue = issueResult.rows[0];
    if (!issue) {
        throw new Error("Issue not found");
    }
    const isMaintainer = user.role === "maintainer";
    if (isMaintainer) {
        const result = await pool.query(`
    DELETE FROM issues WHERE id=$1 
    
    `, [id]);
        return result;
    }
    else {
        throw new Error("Unauthorized to delete this issue");
    }
};
export const issuesService = {
    createIssuesIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB,
};
//# sourceMappingURL=issues.service.js.map