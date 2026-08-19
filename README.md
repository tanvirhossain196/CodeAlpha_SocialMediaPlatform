# Connectly — Social Media Platform

A complete, responsive social networking application built for **CodeAlpha Full Stack Development Internship — Task 2**. Connectly uses a Vanilla HTML/CSS/JavaScript frontend, Express.js REST API, PostgreSQL database, secure authentication, real CRUD operations, and a polished responsive UI.

## Project Overview

Connectly lets users create accounts and profiles, publish text/image posts, browse a personalized feed, like and comment, follow other users, search the community, manage their profile, and receive activity notifications.

**Student:** Md Tanvir Hossain  
**Student ID:** CA/DF1/222740  
**Internship Domain:** Full Stack Development  
**Task:** CodeAlpha Task 2 — Social Media Platform

## Features

- Secure registration, login, logout and authentication persistence
- Password hashing with bcrypt and protected API routes
- Editable user profiles with avatar upload and bio
- Text/image post creation and deletion
- Personalized home feed with fallback discovery content
- Like/unlike with optimistic UI
- Comments with asynchronous creation/deletion
- Follow/unfollow with follower/following lists
- User search by username or full name with debouncing
- Notifications for follows, likes and comments
- Responsive desktop/tablet/mobile layouts
- Desktop left navigation + feed + right information rail
- Mobile top bar + full-width feed + bottom navigation
- Loading, empty, success and error feedback states
- 404 page, accessibility-minded forms, alt text and focus styles
- Centralized backend error handling and parameterized SQL
- File upload validation (images only, max 5 MB)
- Rate limiting, Helmet, CORS and secure cookie configuration

## Tech Stack

### Frontend
- HTML5
- CSS3, CSS Grid, Flexbox, CSS Variables
- Vanilla JavaScript ES6+
- Fetch API / async JavaScript

### Backend
- Node.js
- Express.js
- PostgreSQL + `pg`
- JWT authentication in an HTTP-only cookie
- bcryptjs
- Multer image uploads
- Helmet, CORS, express-rate-limit

## Architecture

```text
CodeAlpha_SocialMediaPlatform/
├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── profile.html
│   ├── edit-profile.html
│   ├── search.html
│   ├── create-post.html
│   ├── post.html
│   ├── notifications.html
│   ├── connections.html
│   ├── followers.html
│   ├── following.html
│   ├── 404.html
│   ├── assets/
│   ├── css/
│   └── js/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md
```

## Database Schema

Main tables:

- `users`
- `posts`
- `comments`
- `likes`
- `followers`
- `notifications`

The schema uses primary keys, foreign keys, unique constraints, timestamps, indexes, cascade deletion, a self-follow check, and composite primary keys to prevent duplicate likes/follows.

Initialize it with:

```bash
npm run db:init
```

## API Documentation

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users
- `GET /api/users/search?q=`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`
- `GET /api/users/:id/followers`
- `GET /api/users/:id/following`

### Posts
- `GET /api/posts`
- `GET /api/posts/:id`
- `GET /api/posts/user/:userId`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `DELETE /api/posts/:id/like`

### Comments
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `DELETE /api/comments/:id`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

## Installation

### Option A — PostgreSQL already installed

1. Create a PostgreSQL database named `connectly`.
2. Install dependencies:

```bash
npm install
```

3. Copy environment settings:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

4. Update `DATABASE_URL` and `JWT_SECRET` inside `.env`.
5. Initialize the database:

```bash
npm run db:init
```

6. Optional demo data:

```bash
npm run db:seed
```

7. Start development server:

```bash
npm run dev
```

8. Open:

```text
http://localhost:4000
```

### Option B — Docker PostgreSQL

```bash
docker compose up -d
npm install
```

Copy `.env.example` to `.env`, then use the default local database URL already shown in the example file and run:

```bash
npm run db:init
npm run db:seed
npm run dev
```

## Environment Variables

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/connectly
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4000
COOKIE_SECURE=false
```

Never commit `.env`.

## Demo

After running `npm run db:seed`, you can sign in with:

```text
Email: ariana@example.com
Password: Connectly123
```

The seed also creates additional users and posts so search, follow and feed interactions can be tested immediately.

## Screenshots

For internship submission, capture these screens after running the project:

1. Landing page
2. Registration / login
3. Home feed
4. Create post + image preview
5. User profile
6. Search / follow system
7. Notifications
8. Mobile responsive layout

## Security Notes

- Passwords are never returned by the API.
- Password hashes use bcrypt with 12 rounds.
- Auth token is stored in an HTTP-only cookie.
- SQL queries use parameters instead of string-interpolated user values.
- Authorization checks protect profile edits and post/comment deletion.
- Image uploads are type/size restricted.
- `helmet`, CORS and auth route rate limiting are enabled.
- Production requires a strong `JWT_SECRET` and `COOKIE_SECURE=true` behind HTTPS.

## Testing Checklist

- [ ] Registration
- [ ] Duplicate username/email validation
- [ ] Login / logout
- [ ] Authentication persistence
- [ ] Profile view / edit / avatar upload
- [ ] Post creation / image upload / deletion
- [ ] Like / unlike
- [ ] Comment add / delete
- [ ] Follow / unfollow
- [ ] Followers / following pages
- [ ] User search
- [ ] Notifications
- [ ] Ownership / authorization errors
- [ ] Mobile 320–767 px
- [ ] Tablet 768–1023 px
- [ ] Desktop 1024+ px
- [ ] No horizontal overflow
- [ ] Browser console free of obvious errors

## GitHub Repository

Required repository name:

```text
CodeAlpha_SocialMediaPlatform
```

Suggested commits:

```text
feat: implement user authentication
feat: add profile management
feat: add social feed and posts
feat: implement like and comment systems
feat: implement follow system and user search
feat: add notifications interface
fix: improve responsive layouts
security: harden API and uploads
docs: complete project README
```

## Future Improvements

- Real-time notifications with WebSocket/Socket.IO
- Cloud image storage (Cloudinary/S3)
- Pagination / infinite scroll
- Password reset / email verification
- Post bookmarks and richer sharing
- Moderation tools and reporting
- Automated API/unit/integration tests

## CodeAlpha Internship

This project intentionally stays aligned with the CodeAlpha requirement to use HTML, CSS and JavaScript on the frontend with Express.js and a database on the backend, while extending the minimum scope with professional UI/UX, validation, responsive behavior, security, and maintainable architecture.
