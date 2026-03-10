# 🎓 Placement Intelligence Portal

**A Department-Based Placement Management System**

The **Placement Intelligence Portal** is a full-stack web application designed to automate and streamline the placement process for educational institutions. It facilitates seamless interaction between students and placement coordinators (admins) while enforcing strict **department-based access control**.

This system replaces traditional Excel-based tracking with a scalable, digital infrastructure that manages student profiles, resumes, skills, and project portfolios, ensuring efficient eligibility tracking and placement readiness.

---

## 🚀 Key Features

### 🎓 Student Features
*   **Registration & Login**: Secure account creation and authentication.
*   **Profile Management**: Comprehensive profile updates including CGPA, branch, internship details, GitHub, and portfolio links.
*   **Skills Management**: Add and track technical skills.
*   **Projects Management**: Showcase academic and personal projects.
*   **Resume Upload**: Upload and manage resumes (PDF format).
*   **Placement Readiness**: Track profile completeness to ensure eligibility.

### 🧑‍💼 Placement Coordinator (Admin) Features
*   **Department-Based Login**: Admins are assigned specific departments (e.g., CSE, ECE, IT) and can only access data relevant to their department.
*   **Dynamic Dashboard**: View real-time statistics such as Total Students, Approved Profiles, and Average Projects.
*   **Smart Student Filtering**: Filter students based on generic criteria (CGPA, Skills, Internships) while automatically enforcing department restrictions.
*   **Student Approval System**: Verify and approve student profiles for placement drives.
*   **Secure Access**: Role-based access control ensures data privacy and security.

---

## 🔐 Department-Based Access Control

A core security feature of this portal is its **strict department-level isolation**.

*   **Admin Assignment**: Each placement coordinator is authenticated with a specific department (e.g., `"AIML"`, `"DS"`, `"IT"`).
*   **JWT Enforcement**: The admin's department is encoded in the JSON Web Token (JWT) upon login.
*   **Backend Restriction**: Middleware and controllers automatically filter all database queries by the admin's department.
    *   *Example*: An **AIML Coordinator** will **only** see and manage students from the **AIML** branch. They cannot access data from **CSE** or **ECE** students.

---

## 🏗️ System Architecture

The project follows a modern **Full-Stack MVC** architecture:

### **Backend (Node.js & Express)**
*   **Server**: Hosted on an Express.js server.
*   **Routes**: Modularized API routes:
    *   `/api/auth` - Authentication & Registration.
    *   `/api/student` - Student profile & data management.
    *   `/api/admin` - Admin dashboard & student management.
*   **Controllers**: Handle business logic and database interactions.
*   **Middleware**: `authMiddleware.js` handles JWT verification and role-based protection (`protect`, `admin`).

### **Frontend (Next.js)**
*   **Framework**: Built with **Next.js (App Router)** for server-side rendering and efficient routing.
*   **Styling**: **Tailwind CSS** for a responsive and modern UI.
*   **Routing**: Role-based dynamic routing ensures users only access pages authorized for their role.
*   **API Integration**: Uses `axios` for seamless communication with the backend.

### **Database (MySQL)**
*   Relational database storing structured data for students, admins, and academic records.

---

## 🗄️ Database Design (High-Level)

| Table | Purpose |
| :--- | :--- |
| **`students`** | Stores student personal details, academic info (CGPA, Branch), and authentication credentials. |
| **`admins`** | Stores placement coordinator credentials and their assigned **department**. |
| **`skills`** | Relational table linking students to their technical skills. |
| **`projects`** | Relational table linking students to their academic or personal projects. |

---

## 📊 Admin Dashboard Stats

The dashboard provides actionable insights dynamically calculated from the database:

1.  **Total Students**: Count of all registered students within the admin's department.
2.  **Approved Profiles**: Count of students marked as "Approved" for placements.
3.  **Average Projects**: The average number of projects completed by students in the department.

*All stats are strictly filtered by the logged-in admin's department.*

---

## 🔍 Student Filtering System

Admins can perform advanced searches to identify eligible students. The system supports filtering by:
*   **CGPA Cutoff**
*   **Specific Skills** (e.g., "React", "Python")
*   **Internship Experience**
*   **Project Count**

**Note**: The system **always** appends the department filter to any search query. An IT admin searching for "CGPA > 8.0" will effectively execute "CGPA > 8.0 AND Branch = 'IT'".

---

## 🛡️ Authentication Flow

1.  **Login**: User sends credentials.
2.  **Token Issuance**: Server validates credentials and issues a **JWT** containing `id`, `role`, and `department` (for admins).
3.  **Storage**: Frontend stores the token (typically in localStorage/cookies).
4.  **Request Authorization**: Every API call includes the token in the `Authorization` header (`Bearer <token>`).
5.  **Validation**: Backend middleware (`protect`) verifies the signature and decodes the user info before granting access.

---

## 📂 File Upload System

*   **Resumes**: Students can upload resumes (PDF only).
*   **Storage**: Files are stored locally in the backend's `/uploads` directory.
*   **Database**: The relative file path is saved in the `students` table.
*   **Security**: Access to these files can be restricted via secure API routes.

---

## 🔮 Future Scope

*   **Placement Drive Management**: creating and managing specific recruitment drives.
*   **Student Application Tracking**: Tracking which students applied to which drive.
*   **Resume Bulk Download**: Zipped verify download for eligible students.
*   **Skill Gap Analyzer**: Analytics to identify missing skills in a batch.
*   **Placement Analytics for Deans**: High-level reporting across all departments.

---

## 🛠️ Setup Instructions

### Prerequisites
*   **Node.js** (v18+)
*   **MySQL Server**
*   **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository_url>
cd placement-intelligence-portal
```

### 2. Backend Setup
```bash
cd backend
npm install
```
**Configure Environment Variables (.env):**
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_db
JWT_SECRET=your_jwt_secret
```
**Start the Backend:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
**Start the Frontend:**
```bash
npm run dev
# App runs on http://localhost:3000
```

### 4. Database Setup
Import the provided SQL schema file into your MySQL database named `placement_db`.

---

## 🔚 Conclusion

The **Placement Intelligence Portal** modernizes the placement workflow by ensuring data accuracy, security, and ease of access. By automating routine tasks and providing department-aware intelligence, it empowers placement coordinators to focus on what matters most—connecting students with the right opportunities.
