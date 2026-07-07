
import { pool } from "../../db";
import type { ROLES } from "../../types";


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


const updateIssueIntoDB = async (payLoad: any, id: string, user: any) => {
    const { title, description, type } = payLoad;

   
    const issueResult = await pool.query(
        `SELECT * FROM issues WHERE id = $1`, 
        [id]
    );
    
    const issue = issueResult.rows[0];
    
    
    if (!issue) {
        throw new Error("Issue not found"); 
    }

    const reporterId = issue.reporter_id;
    const status = issue.status;

    
    const isMaintainer = user.role === 'maintainer';
    const isOwner = reporterId === user.id; 
    const isOpen = status === 'open';

    if (isMaintainer || (user.role === 'contributor' && isOwner && isOpen)) {
        
       
        const result = await pool.query(`
            UPDATE issues SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status),
                updated_at = NOW() 
            WHERE id = $5 
            RETURNING *
        `, [title, description, type,'in_progress', id]);

       
        return result
    } else {
        throw new Error("Unauthorized to update this issue");
    }
};


export const issuesService = {
  createIssuesIntoDB,
  getSingleIssueFromDB,
  updateIssueIntoDB
}
