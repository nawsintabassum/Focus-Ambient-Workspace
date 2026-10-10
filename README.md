# 🎧 Focus & Ambient Sound Workspace

**A Full-Stack Productivity Application for Focus, Relaxation, and Better Time Management**

Focus & Ambient Sound Workspace is a web-based productivity application designed to help users stay focused, manage their time efficiently, and create a personalized working environment with ambient sounds. It combines a focus timer, sound mixer, workspace management, and productivity analytics in one place.

## ✨ Key Features

- ⏱️ **Focus Timer** — Manage focused work sessions and breaks.
- 🎵 **Ambient Sound Library** — Explore 20+ ambient sound options to create a comfortable working environment.
- 🔊 **Sound Mixer** — Control sound playback and adjust the listening experience.
- 🎼 **Custom Audio Upload** — Add your own audio files for a personalized sound experience.
- ⭐ **Favorites** — Save your preferred sounds for quick access.
- 🗂️ **Workspace Management** — Organize your work sessions and personal workspace preferences.
- 📊 **Productivity Analytics** — Review productivity information and track your focus activity.
- 👤 **User Authentication** — Support for account registration and login.
- ⚙️ **Personalized Settings** — Customize your workspace and application preferences.
- 📱 **Responsive Design** — Designed to work across desktop, tablet, and mobile screen sizes.

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- Zod

### Database & Security
- SQLite
- JWT Authentication
- bcrypt Password Hashing

## 📁 Project Structure

```text
focus-ambient-workspace/
├── client/             # Frontend application
├── server/             # Backend API and database
├── package.json        # Project scripts and dependencies
├── package-lock.json   # Dependency lock file
├── .env.example        # Environment configuration template
└── README.md           # Project documentation
```

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory:

```bash
cd focus-ambient-workspace
```

If you have already downloaded the project ZIP, extract it and open the project folder in your terminal.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create the server environment file:

```bash
cp .env.example server/.env
```

Open `server/.env` and configure the required environment variables. Replace the example JWT secret with a long, unique, random value.

**Important:** Never publish your `.env` file or expose your JWT secret in a public repository.

### 4. Generate the Prisma Client

```bash
npm run db:generate
```

### 5. Set Up the Database

Run the database migration:

```bash
npm run db:migrate
```

Seed the database if the project includes the configured seed script:

```bash
npm run db:seed
```

The project uses SQLite, so a separate PostgreSQL server is not required.

### 6. Start the Development Server

```bash
npm run dev
```

Open the local application in your browser:

**http://localhost:5173**

> Note: Run the commands from the project root directory. If a command fails, check the error message and the environment configuration before continuing.

## 🎶 Ambient Sound Experience

Create your own comfortable focus environment with ambient soundscapes. You can explore available sounds, mix sound sources, and upload local audio files for a more personalized experience.

Custom audio availability and persistence may depend on the current browser session and implementation.

## 🔐 Security

- Password hashing with bcrypt.
- JWT-based authentication.
- Environment-based secret configuration.
- Input validation with Zod.
- SQLite database integration through Prisma ORM.

For production deployment, configure secure environment variables, HTTPS, appropriate token handling, and production-ready database backups.

## 🎯 Project Goals

The primary goal of this project is to provide a simple and personalized productivity environment that helps users:

- Improve focus during study or work.
- Build consistent work and break routines.
- Create a relaxing environment with ambient sounds.
- Organize workspaces and review productivity activity.

## 🔮 Future Improvements

- Cloud-based audio uploads and storage.
- Advanced focus-session statistics.
- More customizable timer modes.
- Additional sound categories and playlists.
- Notifications and session reminders.
- Production deployment with persistent user data.

## 👨‍💻 Author

**Nawsin Tabassum**



## 📄 License

This project is intended for educational and development purposes. Add a specific open-source license if you plan to distribute it publicly.
