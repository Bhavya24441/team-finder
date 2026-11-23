# Team Finder

A skill-based team finder for student projects. The app lets members create profiles, find people by skills, invite matches to an open team, apply to requests, review applicant profiles, accept or reject applications, and view skill demand.

## Run locally

Prerequisites: Node.js LTS, MongoDB Atlas, and Visual Studio Code with the Live Server extension.

1. In MongoDB Atlas, create a database and allow the laptops that need to connect. Copy the application connection string.
2. In a terminal, open `server` and install the dependencies:

   ```powershell
   cd server
   npm install
   ```

3. Copy `.env.example` to `.env` inside `server`. Set `MONGO_URI` to your Atlas connection string and replace `SESSION_SECRET` with a long random value. Keep `.env` private.
4. Start the API:

   ```powershell
   npm run dev
   ```

   The API listens on `http://localhost:5000`.
5. Open the repository's `client` folder in VS Code and choose **Go Live**. The provided local origin is `http://127.0.0.1:5500`.

## Team workflow

- On **Find teammates**, search by skills, choose one of your open projects, and send a direct invitation to a match.
- On **Team requests**, invited students can accept or decline. Students can also apply to open requests.
- Request owners can open an applicant's profile, then accept or reject the application. Accepting either an invitation or an application adds the student to the team.

## Project files

- `client/` — AngularJS pages, controllers, styles, and skill chip directive.
- `server/` — Express API, MongoDB models, session authentication, and routes.
- `docs/project-report.md` — project report and captured page screenshots.
- `docs/team-finder-full-code-guide-updated.pdf` — updated member-by-member full-code guide.

## Demo accounts

Seed four fictional student profiles and three open team requests for skill search, applications, and invitations:

```powershell
cd server
npm run seed:demo
```

All four demo accounts use the password `TeamFinderDemo2026!`:

The seed also posts three open requests: **Campus Event Planner** (Alex), **Study Buddy Match App** (Jordan), and **Campus Sustainability Dashboard** (Priya). Each demo account starts with at least one pending invitation; Noah has two. Sign in as any listed demo account and open Team requests to show its inbox.

| Name | Login email | Sample skills |
| --- | --- | --- |
| Alex Rivera | `demo.alex@example.com` | JavaScript, Node.js, MongoDB, React |
| Jordan Kim | `demo.jordan@example.com` | UI/UX, Figma, HTML, CSS, JavaScript |
| Priya Shah | `demo.priya@example.com` | Python, Machine Learning, Data Analysis, MongoDB |
| Noah Williams | `demo.noah@example.com` | React, Node.js, CSS, API Design |

The seed command is safe to rerun: it updates only these four reserved demo email addresses, creates or refreshes the three named demo requests, and adds pending invitations so every demo account has at least one inbox item. It leaves other users and requests untouched. Sign in as Noah to show the invitations under Team requests. These shared credentials are for a local classroom demo only.