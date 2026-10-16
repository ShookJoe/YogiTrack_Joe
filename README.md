# YogiTrack

A MERN-stack (MongoDB, Express, React, Node.js) web application that replaces the paper cards and sign-in sheets at Yoga H'om, a yoga studio. It handles instructors, customers, the class schedule, package sales, attendance, and studio reports.

## Features

Each use case has its own tab in the app.

| Tab | Use case | What it does |
| --- | --- | --- |
| Instructors | Add Instructor | Saves an instructor profile, warns before adding a duplicate name |
| Customers | Add Customer | Saves a customer profile with a class balance that starts at 0 |
| Classes | Add a Class | Schedules a class for an instructor, rejects a double-booked day/time and suggests open slots |
| Packages | Add a Package | Creates a purchasable class pass (category, number of classes, class type, validity window, price) |
| Sales | Record a Sale | Sells a package to a customer, adds the classes to their balance, and sends a simulated notification |
| Attendance | Record Class Attendance | Checks customers into a class, subtracts one class from each balance, and warns when a balance is too low |
| Reports | Generate Studio Reports | Package sales, instructors with their classes and check-ins, customers with their packages (active/future/expired), and monthly teacher payments |

Notifications are simulated: the message is shown in the app and logged on the server as `[notify <contact> -> <address>] ...`.

Teacher payments are the class pay rate times the number of classes taught in the chosen month. A class counts as taught on a day when attendance was recorded for it.

## Project structure

```
YogiTrack/
├── client/    React app (Vite)
│   └── src/   pages/ (one per tab), components/ (Form + List pairs, report views), api.js, auth.js, format.js
├── server/    Express API + Mongoose models
│   ├── models/       Instructor, Customer, Class, Package, Sale, Attendance, Counter
│   ├── routes/       one router per resource, plus reports.js
│   └── middleware/   basicAuth.js
├── Procfile   Heroku process definition
└── package.json   Root scripts that orchestrate client + server
```

## API

Every `/api/*` route sits behind HTTP Basic Auth when `APP_USERNAME` and `APP_PASSWORD` are set.

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Connection check (the login screen uses it to verify credentials) |
| `/api/instructors`, `/api/customers` | GET, POST | List and add people |
| `/api/classes` | GET, POST | List and schedule classes |
| `/api/packages` | GET, POST | List and add packages |
| `/api/sales` | GET, POST | List and record sales |
| `/api/attendance` | GET, POST | List and record attendance |
| `/api/reports/package-sales` | GET | Sales count and revenue per package |
| `/api/reports/instructors` | GET | Instructors, their classes, and check-in counts |
| `/api/reports/customers?today=YYYY-MM-DD` | GET | Customers and their packages by status |
| `/api/reports/teacher-payments?month=YYYY-MM` | GET | Pay per instructor for one month |

IDs are sequential and generated with a counter collection (for example `I00001`, `C00001`, `S00001`).

## Prerequisites

- Node.js 24.x and npm
- MongoDB, either installed locally or a MongoDB Atlas cluster (the free tier is fine)
- A Heroku account (Eco Dyno plan, ~$5/mo) for deployment
- Git and a GitHub repo for source control

## Local development setup

1. Install dependencies for both apps:
   ```bash
   npm run install:all
   ```
2. Create `server/.env` from the example and choose a database. The example has a local MongoDB URI and a commented-out Atlas one, so switching is a one-line change:
   ```bash
   cp server/.env.example server/.env
   ```
   Set `APP_USERNAME` and `APP_PASSWORD` too if you want to try the login screen. Leave them unset for no login.
3. Run both client and server together:
   ```bash
   npm run dev
   ```
   - Client (Vite): http://localhost:5173
   - Server (Express API): http://localhost:5000
   - The client dev server proxies `/api/*` requests to the Express server.
4. Visit http://localhost:5173.

## Deployment (Heroku)

The app is a single Heroku app: Express serves the built React files in production. It deploys from GitHub, so pushing to `master` and deploying from the Heroku dashboard (or turning on Automatic Deploys) publishes a new version.

Config vars to set on Heroku:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Atlas connection string |
| `NODE_ENV` | `production` |
| `APP_USERNAME`, `APP_PASSWORD` | Login for reviewers |
| `NPM_CONFIG_PRODUCTION` | `false`, so Heroku installs Vite for the client build |

Heroku runs `heroku-postbuild` (installs both apps' dependencies and builds the client), then starts the app via the `Procfile` (`npm start`, which runs the Express server).

## Scripts (root package.json)

| Script | Description |
| --- | --- |
| `npm run dev` | Run client + server concurrently for local development |
| `npm run install:all` | Install dependencies for both client and server |
| `npm run build` | Build the production client bundle |
| `npm start` | Start the Express server (serves the built client in production) |
