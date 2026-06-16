# Student Management System

A production-grade, full-stack application built to manage student registration details, track enrollment courses, and optimize operational database lookups. This project features server-side pagination, dynamic keyword search capabilities, strict type-safety data rules, and automated audit activity logging.

## Tech Stack Matrix

| Layer          | Technology                                       | Key Responsibility                           |
|----------------|--------------------------------------------------|----------------------------------------------|
| Frontend       | React.js (Vite), Tailwind CSS, Lucide Icons      | Single Page App (SPA) dashboard UI & filtering controls |
| Backend        | Node.js, Express.js                              | REST API routing, transactions, controller logic |
| Database       | PostgreSQL                                       | Relational transactional persistence layer   |
| Driver         | postgres-js                                      | High-performance template-literal database client |

## System Architecture Blueprint
student-management-system/
├── backend/
│ ├── config/ # Database pool connection and schema setup
│ ├── controllers/ # Route controller execution logic
│ ├── routes/ # REST Endpoint path registries
│ ├── .env # Server variables
│ └── index.js # Entry server gateway
│
└── frontend/
├── src/
│ ├── components/ # Reusable layout fragments
│ ├── services/ # Axios base configurations
│ ├── App.jsx # Dashboard state controller UI
│ └── main.jsx
├── .env # Client-side configuration map
└── vite.config.js

text

## Quick-Start Setup Instructions

### 1. Database Provisioning

Ensure you have a PostgreSQL instance running locally. Open your preferred database tool (pgAdmin, psql CLI) and run:

```sql
CREATE DATABASE student_db;
2. Backend Environment Initialization
Navigate to the backend directory:

bash
cd backend
Install dependency sets:

bash
npm install
Create a .env configuration file in the backend root:

text
PORT=5000
DATABASE_URL=postgresql://postgres:your_password_here@127.0.0.1:5432/student_db
Build the relational tables, index allocations, and log systems:

bash
node config/initSchema.js
Spin up the application in watch-mode:

bash
npm run dev
3. Frontend Compilation Engine
Navigate to your frontend workspace:

bash
cd ../frontend
Install client assets:

bash
npm install
Provision the frontend environment parameters in a .env file at the frontend root:

text
VITE_API_URL=http://localhost:5000
Start up the browser dev instance:

bash
npm run dev
API Endpoints Specification
All base endpoints are hosted natively relative to your server gateway structure (e.g., http://localhost:5000).

Student Administration Layout
1. Get Paginated Records
Method: GET

Path: /students

Query Parameters (Optional):

page (default: 1) — Active page grouping

limit (default: 10) — Item constraints per array payload

search — Case-insensitive string matcher lookup against name

course — Exact string matcher targeting mapped course divisions

Response Status: 200 OK

2. Fetch Profile Details
Method: GET

Path: /students/:id

Response Status: 200 OK / 404 Not Found

3. Register New Student Profile
Method: POST

Path: /students

Payload Structure (JSON):

json
{
  "name": "Jane Doe",
  "course": "Computer Science",
  "date_of_birth": "2001-11-23",
  "email": "jane.doe@example.com",
  "phone_number": "+919999999999",
  "gender": "Female",
  "address": "456 Academic Circle, West Wing"
}
Response Status: 201 Created

4. Update Profile Details
Method: PUT

Path: /students/:id

Payload Structure (JSON): Match full POST payload key requirements.

Response Status: 200 OK / 404 Not Found

5. Terminate Student Profile
Method: DELETE

Path: /students/:id

Response Status: 200 OK / 404 Not Found