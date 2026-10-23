# AI DocCare - Healthcare Management Platform

## Overview
A comprehensive AI-powered healthcare management system with symptom analysis, medical records management, and health tracking capabilities. Now featuring persistent PostgreSQL database storage for all your health data.

## Features
- 🤖 AI-powered symptom checker and health assistant
- 📊 Personal health dashboard with health scoring
- 📋 Medical records management with file uploads
- 💊 Medication tracking with reminders
- 📈 Vital signs tracking with interactive charts
- 📅 Appointment booking system
- 📚 Health articles and educational content
- 👥 Role-based access (Patient, Doctor, Admin)
- 🧠 Machine learning-based chatbot intent classification using trained examples
- 💾 Persistent PostgreSQL database storage

## Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Gemini via the @google/genai package + Trained agent
- Machine Learning: Natural.js with a trained intent classification model using training.json
- **Charts**: Recharts
- **UI Components**: shadcn/ui + Radix UI

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use provided Neon database setup)
- Gemini API Key

### Installation
1. Extract the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Update `.env` file with your credentials:
     - `GEMINI_API_KEY` - Your Gemini API key
     - `DATABASE_URL` - Your PostgreSQL connection string

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5000 in your browser

## Database Setup
The application automatically creates and seeds the database with:
- Default user accounts (patient, doctor, admin)
- Sample health articles
- All necessary tables for healthcare data

## Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/           # Express backend
│   ├── services/     # Business logic and AI integration
│   ├── db.ts         # Database connection
│   ├── routes.ts     # API routes
│   └── storage.ts    # Data storage layer with PostgreSQL
├── shared/           # Shared types and schemas
└── attached_assets/  # Static assets
```

## API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/health-score` - Get health score
- `POST /api/symptom-analysis` - AI symptom analysis
- `GET /api/vitals` - Get vital signs
- `GET /api/appointments` - Get appointments
- `GET /api/medications` - Get medications
- `GET /api/medical-records` - Get medical records
- `GET /api/articles` - Get health articles

## Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=5000
SESSION_SECRET=your_session_secret_here
```

## Database Features
- **Persistent Storage**: All data is stored in PostgreSQL
- **Automatic Seeding**: Initial users and articles are created automatically
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Migration Support**: Easy schema updates with `npm run db:push`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is for educational and demonstration purposes.

## Support
For questions or issues, please refer to the documentation or create an issue in the repository.
