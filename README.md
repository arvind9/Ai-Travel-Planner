# AI Travel Planner (Full-Stack)

An intelligent full-stack web application that leverages the Google Gemini AI engine to generate custom travel itineraries, comprehensive financial cost breakdowns, and weather-aware packing checklists. 

Built with a secured multi-user architecture using a decoupled Node.js/Express backend and a Next.js frontend wrapper.

---

## 📁 Project Architecture

```text
ai-travel-planner/              
├── backend/                    # Node.js + Express + Mongoose API Enclave
│   ├── config/                 # Database connection configurations
│   ├── controllers/            # Gemini API generation & business logic
│   ├── models/                 # Database validation schemas (Trip, User)
│   ├── routes/                 # Express API endpoint routing
│   ├── .env.example            # Environment variables blueprint
│   └── server.js               # Application entry point
└── frontend/                   # Next.js + Tailwind React Client Engine
    ├── src/
    │   └── app/
    │       ├── dashboard/      # Interactive travel timeline panel
    │       ├── login/          # Secure user access gateway
    │       ├── register/       # Identity enrollment view
    │       └── page.tsx        # Automatic routing gateway
    └── package.json

⚙️ Prerequisites & Setup
Ensure you have Node.js (v18+ recommended) installed on your system.

1. Environment Configuration
Go into the backend/ directory, copy the template blueprint, and create your local environment file:

cd backend
cp .env.example .env

Open the newly created .env file and supply your actual credentials:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_fallback_token_encryption_string
GEMINI_API_KEY=your_google_ai_studio_api_key

2. Frontend Configuration
Go into the frontend/ directory and verify that your local development variables point to the local server engine:

cd ../frontend

Create a .env.local file inside the frontend/ folder root and append:

NEXT_PUBLIC_API_URL=http://localhost:5000

🚀 Execution Instructions
To run the application locally, you must launch both the backend database service and the frontend view client simultaneously in separate terminal screens.



Terminal A: Launching the Backend REST API

cd backend
npm install
npm run dev

Expected console output:

Server executing successfully on Port 5000

MongoDB Connected



Terminal B: Launching the Next.js Client Portal

cd frontend
npm install
npm run dev

Expected console output:

Ready in Xms -> Listening on http://localhost:3000

🛠️ Operational Feature Set
1. Secure Registration & Access Logging: Fully isolated user authentication powered by encrypted JSON Web Tokens (JWT) preserved in browser local storage.

2. Generative Itinerary Architecture: Connects to the stable gemini-2.5-flash model endpoint using structured JSON schemas to assemble error-free timelines.

3. Budgetary Breakdown Cards: Computes compartmentalized spending across transport, lodging, dining, and activities instantly.

4. Interactive Timeline Adjustments: Allows live state updates to inject custom traveler events directly onto target itinerary days.

5. Weather-Aware Packing Tracker: Generates dynamic checklists with category-specific tagging and full database synchronization on click states.