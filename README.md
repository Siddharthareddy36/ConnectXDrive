<div align="center">

<h1>🎓 ConnectXDrive</h1>

<p><strong>Bridging Talent with Opportunity.</strong></p>

<p>A data-driven, full-stack Placement Intelligence Portal engineered to streamline campus recruitment for <strong>850+ students</strong> across multiple departments — replacing Excel chaos with enterprise-grade digital infrastructure.</p>

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Overview

**ConnectXDrive** is a production-ready, role-based Placement Intelligence Portal built for educational institutions. It provides a structured, secure, and intelligent interface for both **students** and **placement coordinators (admins)**, enforcing strict **department-level data isolation** throughout.

> Built to handle **850+ student records** across departments including `DS`, `IT`, `AIML`, `CSE`, `ECE`, and more.

---

## ✨ Core Features

### 🧑‍💼 Admin / Coordinator Portal

| Feature | Description |
|---|---|
| 🔒 **Departmental Isolation** | Each coordinator exclusively sees and manages students from **their own branch** (DS, IT, AIML, etc.) — enforced at the JWT and database query level. |
| 👥 **Admin-Adding-Admin** | A built-in system for existing admins to scale the coordination team by onboarding new department coordinators without any external tools. |
| 📣 **Placement Drive Management** | Create, manage, and track recruitment drives — including company details, eligible departments, drive dates, and application deadlines. |
| 📊 **Applicant Analytics Dashboard** | Real-time dashboard with live filtering of students by **CGPA**, **Skills**, **Internship Experience**, and **Project Count**. All queries are auto-scoped to the coordinator's department. |
| 👤 **Student Profile Viewer** | Click any student name in the filter results to view their complete profile — CGPA, skills, projects, and resume — without leaving the portal. |
| ⚙️ **Settings & Security** | Profile management, department info, and password update with current-password verification. |

### 🎓 Student Portal

| Feature | Description |
|---|---|
| 🙍 **Profile Management** | Dynamic, section-by-section profile completion: personal info, CGPA, current year, internship details, GitHub & portfolio links. |
| 📄 **Resume Management** | Secure PDF upload system with backend Multer-powered storage. Students can view and replace their current resume at any time. |
| 🛠️ **Skills Tracking** | Add, manage, and display technical skills that are visible to placement coordinators during filtering. |
| 🗂️ **Projects Showcase** | Log academic and personal projects with titles and descriptions to demonstrate work to recruiters. |
| 🚀 **One-Click Job Applications** | Browse and apply to eligible placement drives in a single click. Eligibility is validated against department and profile status. |
| 🔔 **Live Application Status** | Real-time status tracking — see drive applications marked as **Applied**, **Shortlisted**, or **Rejected** from a dedicated status page. |

---

## 🔐 Security Architecture

ConnectXDrive implements a multi-layer security model:

1. **JWT-Based Authentication** — On login, the server issues a token encoding `id`, `role`, and `department`.
2. **Middleware Enforcement** — Every protected route passes through `authMiddleware.js` which verifies the token and attaches user context.
3. **Departmental Isolation at Query Level** — All admin-facing database queries automatically append a `WHERE branch = '<admin_department>'` clause dynamically. An **IT Coordinator** physically cannot query AIML or CSE student data.
4. **Password Security** — Passwords are hashed using `bcryptjs` before storage. Password updates require verification of the current password.
5. **Role-Based Routing** — Frontend routes are protected by an `AuthContext` that redirects unauthorized users before any page renders.

---

## 🏗️ System Architecture

```
ConnectXDrive/
├── frontend/                  # Next.js 16 App Router (TypeScript)
│   ├── app/
│   │   ├── page.tsx           # Landing Page
│   │   ├── login/             # Admin & Student Login
│   │   ├── register/          # Student Registration
│   │   ├── admin/
│   │   │   ├── dashboard/     # Coordinator Dashboard & Stats
│   │   │   ├── filter/        # Advanced Student Filtering
│   │   │   ├── drives/        # Placement Drive Management
│   │   │   ├── students/      # Student Profile Viewer
│   │   │   └── settings/      # Admin Profile & Security
│   │   └── student/
│   │       ├── dashboard/     # Student Home & Completion Status
│   │       ├── profile/       # Profile Editor
│   │       ├── skills/        # Skills Management
│   │       ├── projects/      # Projects Management
│   │       ├── resume/        # Resume Upload & Management
│   │       ├── drives/        # Browse Available Drives
│   │       ├── applications/  # Application Status Tracker
│   │       └── settings/      # Student Settings
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state & route protection
│   └── components/            # Reusable UI components (shadcn/ui)
│
└── backend/                   # Node.js + Express.js REST API
    ├── server.js              # Entry point
    ├── routes/                # API route definitions
    ├── controllers/           # Business logic handlers
    ├── middleware/
    │   └── authMiddleware.js  # JWT verification & role guards
    ├── config/                # DB connection pool
    ├── sql/                   # SQL migration scripts
    └── uploads/               # Secure resume file storage
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| **`students`** | Student credentials, personal info, CGPA, branch, internship data, GitHub/portfolio links, profile status, and resume path. Indexed on `(branch, cgpa)` for performant coordinator queries. |
| **`admins`** | Placement coordinator credentials and their assigned `department`. Supports multi-department scalability. |
| **`skills`** | Relational table linking students to their tracked technical skills. |
| **`projects`** | Relational table linking students to their academic or personal projects. |
| **`placement_drives`** | Recruitment drives with company name, role, eligible departments, drive date, deadline, and status. |
| **`drive_applications`** | Junction table tracking which student applied to which drive (`applied`, `shortlisted`, `rejected`). |
| **`notifications`** | Push notification records for student-facing status updates. |

### SQL Migrations

```bash
# Run the main schema migration
node backend/migrate.js

# Run settings-related migrations
node backend/migrate_settings.js

# Apply placement drives schema (from /sql/)
mysql -u root -p placement_portal < backend/sql/placement_drives.sql

# Apply branch standardization migration
mysql -u root -p placement_portal < backend/sql/migrate_branches.sql
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| Next.js | 16 (App Router) | React framework, SSR, routing |
| TypeScript | ^5 | Type-safe development |
| Tailwind CSS | ^4 | Utility-first responsive styling |
| Framer Motion | ^12 | Micro-animations & transitions |
| Lucide React | ^0.563 | Icon system |
| shadcn/ui + Radix UI | Latest | Accessible UI primitives |
| Recharts | ^3 | Data visualization |
| Axios | ^1 | HTTP client for API calls |

### Backend
| Technology | Version | Role |
|---|---|---|
| Node.js | v18+ | Runtime environment |
| Express.js | ^5 | REST API framework |
| mysql2 | ^3 | MySQL database driver |
| jsonwebtoken | ^9 | JWT generation & verification |
| bcryptjs | ^3 | Password hashing |
| Multer | ^2 | File upload handling (resumes) |
| dotenv | ^17 | Environment variable management |
| nodemon | ^3 | Development auto-restart |

### Database
| Technology | Role |
|---|---|
| MySQL | Primary relational database — structured for scalability with 850+ student records |

---

## ⚡ Local Setup

### Prerequisites

- **Node.js** v18 or higher
- **MySQL Server** 8.0+
- **npm** package manager
- **Git**

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Siddharthareddy36/ConnectXDrive.git
cd ConnectXDrive
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

**Create the `.env` file** inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal
JWT_SECRET=your_super_secret_jwt_key_here
```

**Run database migrations:**

```bash
# Create the core tables
node migrate.js

# Add settings/security columns
node migrate_settings.js

# Create placement drives tables (using MySQL CLI)
mysql -u root -p placement_portal < sql/placement_drives.sql
mysql -u root -p placement_portal < sql/migrate_branches.sql
```

**Start the backend server:**

```bash
npm start
# ✅ Server running on http://localhost:5000
```

---

### Step 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

**Create `.env.local`** inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Start the frontend dev server:**

```bash
npm run dev
# ✅ App running on http://localhost:3000
```

---

### Step 4 — Seed an Admin Account

Use MySQL CLI or Workbench to manually insert the first coordinator:

```sql
USE placement_portal;

INSERT INTO admins (name, email, password, department)
VALUES (
  'Admin Name',
  'admin@college.edu',
  '$2a$10$<bcrypt_hash_of_your_password>',
  'IT'
);
```

> **Tip:** Use the [bcrypt online tool](https://bcrypt-generator.com/) or a seeder script to generate the initial hashed password.

---

## 🗺️ API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new student |
| `POST` | `/api/auth/student/login` | Student login → JWT |
| `POST` | `/api/auth/admin/login` | Coordinator login → JWT |

### Student Routes — `/api/student` *(Protected)*
| Method | Endpoint | Description |
|---|---|---|
| `GET/PUT` | `/api/student/profile` | Get or update student profile |
| `GET/POST/DELETE` | `/api/student/skills` | Manage skills |
| `GET/POST/DELETE` | `/api/student/projects` | Manage projects |
| `POST` | `/api/student/resume` | Upload resume (PDF) |
| `GET` | `/api/student/drives` | List eligible placement drives |
| `POST` | `/api/student/drives/:id/apply` | Apply to a drive |
| `GET` | `/api/student/applications` | View application statuses |

### Admin Routes — `/api/admin` *(Protected · Dept-Scoped)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Department-scoped dashboard stats |
| `GET` | `/api/admin/students` | Filter students (CGPA, skills, etc.) |
| `GET` | `/api/admin/students/:id` | View a specific student's full profile |
| `GET/POST` | `/api/admin/drives` | List or create placement drives |
| `PUT` | `/api/admin/drives/:id/applicants/:sid` | Update applicant status (shortlist/reject) |
| `GET/PUT` | `/api/admin/settings` | View/update coordinator settings |
| `POST` | `/api/admin/add-admin` | Add a new coordinator (Admin-Adding-Admin) |

---

## 📸 Application Screens

| Screen | Route |
|---|---|
| 🏠 Landing Page | `/` |
| 🔑 Student Login | `/login/student` |
| 🔑 Admin Login | `/login/admin` |
| 📊 Student Dashboard | `/student/dashboard` |
| 📊 Admin Dashboard | `/admin/dashboard` |
| 🔍 Student Filter | `/admin/filter` |
| 🚗 Placement Drives (Admin) | `/admin/drives` |
| 📁 Student Profile View | `/admin/students/[id]` |
| 📝 Student Profile Editor | `/student/profile` |
| 📎 Resume Upload | `/student/resume` |
| 📋 Application Status | `/student/applications` |

---

## 🔮 Roadmap

- [ ] 📦 **Bulk Resume Download** — Zip download of resumes for all eligible students in a drive
- [ ] 📈 **Skill Gap Analyzer** — Analytics to identify missing skills across a batch
- [ ] 🏛️ **Dean's Overview Dashboard** — High-level cross-department placement analytics
- [ ] 📧 **Email Notifications** — Automated emails for shortlisting and status updates
- [ ] 📱 **Mobile-Responsive Polish** — Full PWA-grade mobile experience

---

## 🤝 Contributing

This project is actively developed for campus deployment. Contributions, bug reports, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**ConnectXDrive** — *Built to connect students with the opportunities they deserve.*

Made with ❤️ for the next generation of engineers.

</div>
