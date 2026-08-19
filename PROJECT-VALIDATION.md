# Connectly Project Validation

## Static validation completed

- JavaScript syntax check: PASS
- Required project files: PASS
- Local HTML CSS/JS/page references: PASS
- Frontend/backend separation: PASS
- Responsive CSS breakpoints present: PASS
- PostgreSQL schema includes users/posts/comments/likes/followers/notifications: PASS
- Duplicate like/follow prevention constraints: PASS
- Password hashing implementation: PASS
- Authentication middleware: PASS
- Ownership checks for profile/post/comment mutations: PASS
- Parameterized SQL queries: PASS
- Image upload type/size validation: PASS
- Centralized error handling: PASS
- `.env` excluded by `.gitignore`: PASS

## Runtime validation to perform after PostgreSQL is available

Run:

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

Then test registration, login/logout, profile editing, image upload, post CRUD, likes, comments, follow/unfollow, search, notifications and responsive layouts in a browser.

> Note: dependency download/database runtime testing cannot be completed in the artifact build sandbox because it does not provide the user's local PostgreSQL environment and package registry access may be unavailable. The source was statically validated before packaging.
