# Personal Finance App

## Overview
A personal, offline-first finance application built to reduce anxiety and provide clarity.
- **Local Data**: All data is stored in `finance.db` on your machine.
- **Zero Cloud**: No external APIs or bank connections.
- **Simple**: Income, Expenses, Savings, and Goals.

## Tech Stack
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 3001)
- **Database**: SQLite (local file)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
   (This installs both root, server, and client dependencies automatically if you use the recursive install, but for now, run `npm install` in the root).
   
   *Note: If `npm install` in root doesn't install sub-folders, you may need:*
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

2. Start the application:
   ```bash
   npm run dev
   ```

3. Open your browser:
   [http://localhost:5173](http://localhost:5173)

## Features
- **Dashboard**: View your verified monthly income vs expenses.
- **Transactions**: Log spending with categories.
- **Settings**: Set your fixed monthly salary to establish a baseline.
- **Privacy**: Delete `finance.db` to reset everything.

## Troubleshooting
- If the graph/data doesn't load, ensure the backend (`npm run dev --prefix server`) is running on port 3001.
- Initial load might be empty until you set a Salary in Settings.
