# DevNest API

Backend for DevNest — a developer-focused SaaS platform where users can create, sell, and enroll in video-based technical courses.

## Tech Stack

- NestJS + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (video + thumbnail storage)
- Stripe (test mode payments)
- FFmpeg (thumbnail generation + video duration extraction)

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- FFmpeg installed on your machine
- Cloudinary account
- Stripe account (test mode)

## Setup

### 1. Clone the repo
\`\`\`bash
git clone <your-repo-url>
cd course-platfrom-be
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup environment variables
\`\`\`bash
cp .env.example .env
\`\`\`
Fill in all values in `.env`

### 4. Run the server
\`\`\`bash
npm run start:dev
\`\`\`

Server runs on `http://localhost:3000/api`

## Environment Variables

| Key | Description |
|-----|-------------|
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRES_IN | JWT expiry duration (e.g. 7d) |
| CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name |
| CLOUDINARY_API_KEY | Your Cloudinary API key |
| CLOUDINARY_API_SECRET | Your Cloudinary API secret |
| CLOUDINARY_UPLOAD_PRESET | Your Cloudinary upload preset name |
| STRIPE_SECRET_KEY | Stripe secret key (sk_test_xxx) |
| PORT | Server port (default: 3000) |
| FRONTEND_URL | Frontend URL for CORS |

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | Public | Register with name, email, password, role |
| POST | /auth/login | Public | Login, returns JWT |
| GET | /auth/me | Auth | Returns current user |

### Courses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /courses | Mentor | Create course with video upload |
| GET | /courses | Public | Paginated list with filters |
| GET | /courses/:id | Public | Course detail |
| GET | /courses/my | Mentor | Mentor's own courses |
| PATCH | /courses/:id | Mentor | Edit course |
| DELETE | /courses/:id | Mentor | Delete course |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /orders | Learner | Create Stripe PaymentIntent |
| POST | /orders/:id/confirm | Learner | Confirm payment + create enrollment |
| GET | /orders/my | Learner | Order history |

### Enrollments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /enrollments/my | Learner | Enrolled courses with progress |
| PATCH | /enrollments/:id | Learner | Update watch progress |

### Stream
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /stream/:courseId | Auth + Enrolled | Secure video stream proxy |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /dashboard/mentor | Mentor | Revenue + sales per course |
| GET | /dashboard/learner | Learner | Enrolled courses + progress |

## Stripe Test Card