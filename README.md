# Team Finder

A skill-based team finder for student projects. The app lets members create profiles, find people by skills, post project team requests, apply to requests, review applications, and view skill demand.

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

## Project files

- `client/` — AngularJS pages, controllers, styles, and skill chip directive.
- `server/` — Express API, MongoDB models, session authentication, and routes.
- `docs/project-report.md` — project report and captured page screenshots.
