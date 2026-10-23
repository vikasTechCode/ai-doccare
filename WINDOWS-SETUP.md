# Windows Setup Guide for AI DocCare

## Quick Fix for Windows Users

If you get the error `'NODE_ENV' is not recognized as an internal or external command`, follow these steps:

### Step 1: Install Dependencies

The project scripts use `cross-env`, so the same commands work in Windows Command Prompt, PowerShell, macOS, and Linux.

```cmd
npm install
```

### Step 2: Set Up Database
You need a PostgreSQL database. Choose one option:

#### Option A: Neon Database (Free, Recommended)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@host.neon.tech/database_name
   OPENAI_API_KEY=your_openai_api_key_here
   ```

#### Option B: Local PostgreSQL (Recommended for Local Development)
1. **Install PostgreSQL:**
   - Download from https://www.postgresql.org/download/windows/
   - During installation, set a password for `postgres` user
   - Keep default port `5432`

2. **Create database:**
   ```cmd
   "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE ai_doccare;"
   ```

3. **Update your `.env` file:**
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_doccare
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=healthcare_secret_key_2024
   ```
   Replace `your_password` with your PostgreSQL password.

### Step 3: Initialize Database
```cmd
npm run db:push
```

### Step 4: Start the Application
```cmd
npm run dev
```

## Default Login Credentials
- **Patient**: `patient` / `password`
- **Doctor**: `doctor` / `password`
- **Admin**: `admin` / `password`

## Troubleshooting

### If you get database connection errors:
- Make sure your DATABASE_URL is correct
- Check that your database is running
- Verify your credentials

### If you get OpenAI errors:
- Get an API key from https://platform.openai.com
- Add it to your `.env` file

### If the application won't start:
- Make sure you have Node.js 18+ installed
- Run `npm install` again
- Check that all environment variables are set

## Alternative Commands for Windows

If npm scripts don't work, you can run commands directly:

```cmd
# Start development server
npx cross-env NODE_ENV=development tsx server/index.ts

# Push database schema
npx drizzle-kit push

# Build the application
npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

Your AI DocCare platform should now run properly on Windows!