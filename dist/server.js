

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/signup/signup.router.ts
import { Router } from "express";

// src/modules/auth/signup/signup.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL,
      email  VARCHAR(20) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()


      )
      `);
    await pool.query(`
       CREATE TABLE IF NOT EXISTS issues(
       id SERIAL PRIMARY KEY,
       title VARCHAR(150) NOT NULL,
       description TEXT NOT NULL CHECK (char_length(description)>=20) ,
       type VARCHAR(20) NOT NULL CHECK (type IN ('bug','feature_request')),
       status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
       reporter_id INT  REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW(),
       CONSTRAINT unique_title_per_reporter UNIQUE (title, reporter_id)



      )`);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/signup/signup.service.ts
var registerUserIntoDB = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  console.log(result);
  return result;
};
var signupService = {
  registerUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/signup/signup.controller.ts
var registerUser = async (req, res) => {
  try {
    const result = await signupService.registerUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var signupController = {
  registerUser
};

// src/modules/auth/signup/signup.router.ts
var router = Router();
router.post("/signup", signupController.registerUser);
var signupRoute = router;

// src/modules/auth/login/login.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/login/login.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var loginUserIntoDB = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!! Please register");
  }
  const user = userData.rows[0];
  const matchedPassword = await bcrypt2.compare(password, user.password);
  if (!matchedPassword) {
    throw new Error("Invalid Credentials!! Please register");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(jwtPayLoad, config_default.secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { token, user };
};
var loginService = {
  loginUserIntoDB
};

// src/modules/auth/login/login.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await loginService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginController = {
  loginUser
};

// src/modules/auth/login/login.route.ts
var router2 = Router2();
router2.post("/login", loginController.loginUser);
var loginRoute = router2;

// src/modules/issues/issues.route.ts
import { Router as Router3 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesIntoDB = async (payLoad, user) => {
  const { title, description, type, status } = payLoad;
  const { id } = user;
  try {
    const result = await pool.query(
      `
            INSERT INTO issues (title,description,type,status,reporter_id) VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
            `,
      [title, description, type, status, id]
    );
    return result;
  } catch (error) {
    throw new Error("You have already created an issue with this exact title.");
  }
};
var getAllIssuesFromDB = async (queryParams) => {
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
  const reporterIds = [
    ...new Set(issues.map((issue) => issue.reporter_id).filter(Boolean))
  ];
  let userMap = {};
  if (reporterIds.length > 0) {
    const userQueryText = `
        SELECT id, name, role FROM users WHERE id = ANY($1)
        `;
    const userResult = await pool.query(userQueryText, [reporterIds]);
    userMap = userResult.rows.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    const formattedIssues = issues.map((issue) => {
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        //attach the matched reporter object, or null if not found
        reporter: userMap[issue.reporter_id] || null,
        // userMap[1] = {id:1,name:"afrina",role:"maintainer"}
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    });
    return formattedIssues;
  }
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const reporterId = issue.reporter_id;
  const userResult = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=$1
    
    `,
    [reporterId]
  );
  const reporter = userResult.rows[0] || null;
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return formattedIssue;
};
var updateIssueIntoDB = async (payLoad, id, user) => {
  const { title, description, type } = payLoad;
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
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
  if (isMaintainer || user.role === "contributor" && isOwner && isOpen) {
    let nextStatus = currentStatus;
    if (isMaintainer) {
      if (currentStatus === "open") {
        nextStatus = "in_progress";
      } else if (currentStatus === "in_progress") {
        nextStatus = "resolved";
      } else if (currentStatus === "resolved") {
        throw new Error("Cannot update an issue that is already resolved");
      }
    }
    const result = await pool.query(
      `
            UPDATE issues SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status),
                updated_at = NOW() 
            WHERE id = $5 
            RETURNING *
        `,
      [title, description, type, nextStatus, id]
    );
    return result;
  } else {
    throw new Error("Unauthorized to update this issue");
  }
};
var deleteIssueFromDB = async (id, user) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const isMaintainer = user.role === "maintainer";
  if (isMaintainer) {
    const result = await pool.query(
      `
    DELETE FROM issues WHERE id=$1 
    
    `,
      [id]
    );
    return result;
  } else {
    throw new Error("Unauthorized to delete this issue");
  }
};
var issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  const user = req.user;
  const result = await issuesService.createIssuesIntoDB(
    req.body,
    user
  );
  try {
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssueFromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const result = await issuesService.updateIssueIntoDB(
      req.body,
      id,
      user
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssus = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const result = await issuesService.deleteIssueFromDB(
      id,
      user
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssus
};

// src/modules/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const decodedToken = jwt2.verify(token, config_default.secret);
      const userDataFromDB = await pool.query(`
           SELECT * FROM users WHERE email=$1 
            `, [decodedToken.email]);
      const user = userDataFromDB.rows[0];
      if (userDataFromDB.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }
      req.user = decodedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router3 = Router3();
router3.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.createIssues);
router3.get("/", issuesController.getAllIssues);
router3.get("/:id", issuesController.getSingleIssue);
router3.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.updateIssue);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issuesController.deleteIssus);
var issuesRoute = router3;

// src/app.ts
import cors from "cors";

// src/modules/middleware/globalErrorHandler.ts
var globalErrorHandler = ((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    author: "Afrina Swarna"
  });
});
app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRoute);
app.use("/api/issues", issuesRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map