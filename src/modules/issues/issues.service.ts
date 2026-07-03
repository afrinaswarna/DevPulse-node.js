import { signupController } from "./../auth/signup/signup.controller";
import { pool } from "../../db";

const createIssuesIntoDB = async (payLoad: any, user: any) => {
  const { title, description, type, status } = payLoad;
  const { id } = user;
  const result = await pool.query(
    `
            INSERT INTO issues (title,description,type,status,reporter_id) VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
            `,
    [title, description, type, status, id],
  );

  return result;
};
const getSingleIssueFromDB = async (id: string) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id],
  );

  if (issueResult.rows.length === 0) {
   throw new Error("Issue not found")
  }

  const issue = issueResult.rows[0]

  const reporterId = issue.reporter_id

  const userResult = await pool.query(`
    SELECT id, name, role FROM users WHERE id=$1
    
    `,[reporterId])

    const reporter = userResult.rows[0] || null

    const formattedIssue = {
        id:issue.id,
        title:issue.title,
        description:issue.description,
        type:issue.type,
        status:issue.status,
        reporter:reporter,
        created_at:issue.created_at,
        updated_at:issue.updated_at
    }
  return formattedIssue;
};

export const issuesService = {
  createIssuesIntoDB,
  getSingleIssueFromDB,
};
