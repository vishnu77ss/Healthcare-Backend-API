# 🏥 Healthcare Backend API System - Full Stack Internship Assignment

**Candidate:** Mediboina Vishnu Murthy

This project is a secure, RESTful backend system built to manage users, doctors, patients, and their mappings for a modern healthcare application.

## 🚀 Key Features & Architectural Decisions (Extra Edge)

| Feature                              | Purpose                                                                                                           | Skill Demonstrated                                             |
| :----------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **MERN Stack**                       | Built using Node.js/Express/Mongoose/MongoDB.                                                                     | Aligns with my career objective as a **MERN Stack Developer**. |
| **Role-Based Access Control (RBAC)** | Restricts sensitive actions (e.g., adding/deleting doctors) to **`admin`** users only.                            | Advanced Authorization and Security by Design.                 |
| **Token-Based Rate Limiting**        | Implemented on the login endpoint (`/api/auth/login`).                                                            | Prevents Brute-Force Attacks (Security best practice).         |
| **Mongoose Query Population**        | Retrieves full `patient` and `doctor` details in one efficient database query (on GET mappings).                  | Demonstrates efficient data modeling and query optimization.   |
| **Input Validation**                 | Uses `express-validator` to ensure data integrity for all POST/PUT requests (e.g., valid email, required fields). | Robust, production-ready code implementation.                  |

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **Security/Config:** `dotenv`, `express-rate-limit`

## ⚙️ Project Setup and Running Instructions

1.  **Clone the repository:** `git clone https://github.com/vishnu77ss/Healthcare-Backend-API`
2.  **Navigate to the folder:** `cd healthcare-backend-api`
3.  **Install dependencies:** `npm install`
4.  **Configure Environment:** Create a **`.env`** file with the `MONGO_URI`, `JWT_SECRET`, and `ADMIN_EMAIL`.
5.  **Start the server:** `npm run dev`

The API will run on `http://localhost:5000`.

## 🧪 Testing and API Documentation

All API endpoints were rigorously tested using **Postman**. A detailed collection is available for review:

- **🔗 Postman Collection Link:** [https://vishnu-0811.postman.co/workspace/Healthcare-API-Assignment~6f2b3c51-27ee-4b10-8264-f5bfa1a28895/collection/44123264-b1b5b73a-7751-4953-a44e-178c3221eb49?action=share&creator=44123264&active-environment=44123264-129467d2-8d6c-415a-8382-22f47e4b7c42]

| Category                            | Method | Endpoint             | Required Auth | Access                            |
| :---------------------------------- | :----- | :------------------- | :------------ | :-------------------------------- |
| **Auth**                            | `POST` | `/api/auth/register` | None          | Public                            |
| **Auth**                            | `POST` | `/api/auth/login`    | None          | Public                            |
| **Patient**                         | `POST` | `/api/patients`      | Token         | Basic/Admin                       |
| **Patient**                         | `GET`  | `/api/patients`      | Token         | Basic/Admin (Filtered by creator) |
| **Mapping**                         | `GET`  | `/api/mappings`      | Token         | Basic/Admin (Populated response)  |
| **Doctor**                          | `POST` | `/api/doctors`       | Token         | **Admin Only**                    |
| **...and all other CRUD endpoints** |        |                      |               |                                   |

---

**Thank you for the opportunity. I look forward to the interview!**
