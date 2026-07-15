# 🚀 devPulse-project
**Internal Tech Issue & Feature Tracker**

**A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.**

**Live API URL:** [https://dev-pulse-project-psi.vercel.app/](https://dev-pulse-project-psi.vercel.app/)



## ✨ Features

- **Advanced Querying & Filtering:** Seamlessly search, filter, and sort issues by **Type** (e.g., Bug, Feature), **Status** (e.g., Open, In Progress, Resolved), and **Time** (`created_at` ASC/DESC).
- **Role-Based Access Control (RBAC):**
  - **Maintainers:** Hold administrative privileges. Only maintainers can transition the workflow status of any issue and update/modify all system issues.
  - **Contributors:** Can create issues and update fields (title, description) of their *own* created issues, but cannot modify workflow statuses or other contributors' issues.
- **Modular System Architecture:** Designed using clean, scalable architectural patterns isolating routes, controllers, services, and data layers per module.
- **Reusable Utility Paradigm:** Shares core functional blocks (e.g., validation runners, custom error formatters, DB query helpers) out of a unified `utils` directory to enforce DRY principles.
- **Production-Ready Deployment:** Configured, optimized, and deployed on **Vercel** with environment isolation.


## 🛠️ Tech Stack

- **Runtime Environment:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (with `pg` Connection Pooling)
- **Deployment Platform:** Vercel


## 🗄️ Database Schema Summary
### 1. `users` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for each user |
| `name` | `VARCHAR(100)`| `NOT NULL` | Full name of the user |
| `role` | `VARCHAR(20)` | `NOT NULL` | Must be either `'maintainer'` or `'contributor'` |

### 2. `issues` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for each issue |
| `title` | `VARCHAR(255)`| `NOT NULL` | Brief summary of the issue |
| `description`| `TEXT` | `NOT NULL` | In-depth description of the bug/feature |
| `type` | `VARCHAR(50)` | `NOT NULL` | Filter criteria (e.g., `'bug'`, `'feature'`) |
| `status` | `VARCHAR(50)` | `NOT NULL` | Workflow state (e.g., `'open'`, `'in-progress'`, `'resolved'`) |
| `reporter_id`| `INTEGER` | `FOREIGN KEY REFERENCES users(id)` | The user who opened the issue |
| `created_at` | `TIMESTAMP`   | `DEFAULT CURRENT_TIMESTAMP` | Internal timestamp used for chronological sorting |
| `updated_at` | `TIMESTAMP`   | `DEFAULT CURRENT_TIMESTAMP` | Last modification timestamp |



## 🚀 Setup & Installation Steps

Follow these instructions to clone, configure, and run the development environment locally.

### Prerequisites
Before you begin, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (running instance)
- **npm** (comes packaged with Node.js)

---

### 1. Clone the Repository
Open your terminal and run the following commands to clone the repository and navigate into the project root directory:
```bash
git clone [https://github.com/your-username/devPulse-project.git](https://github.com/your-username/devPulse-project.git)
cd devPulse-project
```
###  2. Install Dependencies
Install all the required production and development dependencies specified in the `package.json` file:
```bash
npm install
```
### 3. Configure Environment Variables
Create a file named .env in the root directory of your project and add your specific database credentials along with the application runtime variables:


PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devpulse_db


### 4. Initialize Database Schemas
Connect to your PostgreSQL database instance using your preferred client (e.g., pgAdmin, DBeaver, or psql tool) and run the following script to create the necessary tables with constraints:

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('maintainer', 'contributor')) NOT NULL
);

CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'open' NOT NULL,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### 5. Compile and Run the Application
🔹 Development Mode (With Hot-Reloading)
To run the server locally with automated change detection:
```bash
npm run dev
```