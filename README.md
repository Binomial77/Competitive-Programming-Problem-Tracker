# Problem Tracker

A full-stack web application to log and track your DSA/competitive programming practice problems.

## Features

- User authentication (signup/login with JWT)
- Log problems with name, URL, approach/notes and difficulty rating
- Difficulty rating displayed with Codeforces rank colour system
- Search problems by name or URL
- Bulk delete problems
- Clean minimal UI

## Tech Stack

**Backend:** Go, net/http, GORM, JWT  
**Frontend:** HTML, CSS, Vanilla JavaScript  
**Database:** SQLite

## Project Structure

```
├── cmd/server        # Entry point
├── database          # DB connection and config
├── frontend          # HTML, CSS, JS files
├── handlers          # Route handler functions
├── middleware        # JWT auth middleware
├── models            # Database models
├── repository        # Database query logic
└── routes            # Route definitions
```
## Setup and Running Locally

1. Clone the repository
```bash
   git clone https://github.com/Binomial77/Competitive-Programming-Problem-Tracker.git
```

2. Create a `.env` file in the root directory using `.env.example` as reference

3. Run the server
```bash
   go run cmd/server/main.go
```

4. Open `frontend/dashboard.html` in your browser
