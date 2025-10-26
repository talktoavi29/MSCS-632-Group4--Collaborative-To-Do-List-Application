# Trezello

Collaborative to-do application with a Java Spring Boot backend and a TypeScript browser frontend. Supports multi-user access, role-based permissions, task categorization, status tracking, and optimistic concurrency.

## Features

* Signup and login with BCrypt password hashing
* Roles: ADMIN and USER
* Admin can view all users, assign tasks to any user, and delete tasks
* User can view only own record and manage own tasks
* Tasks: title, description, category, status, assignee, timestamps, version
* Optimistic concurrency with version checks and 409 handling
* JSON file storage for transparency in a classroom setting
* Public DTOs returned by the API so password hashes never appear in responses

## Project structure

```
trezello/
  ├─ src/main/java/...               # Spring Boot app, controllers, services, stores, models, DTOs
  ├─ src/main/resources/
  │   └─ static/                     # Frontend (TS compiled to JS, HTML, CSS)
  ├─ data/
  │   ├─ users.json                  # JSON store for users
  │   └─ tasks.json                  # JSON store for tasks
  ├─ pom.xml
  └─ README.md
```

## Prerequisites

* Java 21
* Maven 3.9+
* Node 18+ and npm (for building TypeScript)

## Setup and run

1. Install backend dependencies and start Spring Boot

```bash
mvn clean spring-boot:run
```

2. Build the frontend TypeScript to ES modules

```bash
# from the project root where package.json and tsconfig.json reside
npm install
npm run ts:build    # or npm run ts:watch during development
```

3. Open the app

* Login page: `http://localhost:8080/login.html`
* Main app: `http://localhost:8080/`

## Initial data and credentials

Edit `data/users.json` to include at least one admin and one user. Example:

```json
[ {
  "id" : "68f31e79-2c2b-4f15-a421-f08e26ff25af",
  "username" : "Abhishek",
  "role" : "ADMIN",
  "passwordHash" : "$2b$10$B6IrXtYbbD6bIdr3jjj06.jzxPRIqpqiuzaSewFiSRG80L4oYk5PG"
}, {
  "id" : "a51eba5d-db11-4a35-99d2-e35b04796b88",
  "username" : "Aaradhya",
  "role" : "USER",
  "passwordHash" : "$2b$10$1Cw8/Us7/Wau0y4G0tRnCuufEc6EJfg7vMQQwpRxZDV31L.p7MIvK"
}, {
  "id" : "6d6976bf-37aa-4a7c-8715-d92318f8c611",
  "username" : "Reza",
  "role" : "USER",
  "passwordHash" : "$2a$10$jFwbAj0gWQC0pXEukD0vCOKUp8gWufMJDcHHgqhNykkQKaINUA3JW"
} ]
```

Plaintext passwords for the above hashes:

* Abhishek -> `Abhishek123!`
* Aaradhya -> `Aaradhya123!`
* Reza     -> `Reza123!`

## Authentication and session

* `POST /auth/signup` creates a USER account only
* `POST /auth/login` returns `{ id, username, role }`
* The browser stores this object in `localStorage` as `trezello.user`
* The frontend sends `X-User-Id` on each request
* The server derives the true role from the stored user record and does not trust any client role header

## API overview

Base URL: `http://localhost:8080`

Headers required for protected endpoints:

```
X-User-Id: <current user id>
Content-Type: application/json
```

### Auth

* `POST /auth/signup`
  Body: `{"username":"alice","password":"StrongP@ss1"}`
  Returns: `{"id":"...","username":"alice","role":"USER"}`

* `POST /auth/login`
  Body: `{"username":"abhishek","password":"Abhishek123!"}`
  Returns: `{"id":"...","username":"Abhishek","role":"ADMIN"}`

### Users

* `GET /users`
  Admin sees all users. User sees only self.
  Returns array of `{"id","username","role"}`. Never returns password hashes.

### Tasks

* `GET /tasks?assigneeId=<userId>&status=<STATUS>&category=<string>`
  Returns tasks for the selected user with optional filters.

* `POST /tasks`
  Body (use only 1 at a time):

  ```json
  [ 
    {
  "id" : "fab6e747-7535-43a3-a05a-bd5fc15d5537",
  "title" : "Study Math",
  "description" : "Kids Duty",
  "status" : "PENDING",
  "category" : "Growth",
  "assigneeId" : "a51eba5d-db11-4a35-99d2-e35b04796b88",
  "version" : 1,
  "createdAt" : "2025-10-25T16:48:11.330382Z",
  "updatedAt" : "2025-10-25T16:48:11.330382Z"
}, 
{
  "id" : "1d421bbb-77a5-486d-a6b7-78a1daca1c06",
  "title" : "Build Backend",
  "description" : "Day 2 Development",
  "status" : "PENDING",
  "category" : "Work",
  "assigneeId" : "68f31e79-2c2b-4f15-a421-f08e26ff25af",
  "version" : 1,
  "createdAt" : "2025-10-25T22:21:58.013673800Z",
  "updatedAt" : "2025-10-25T22:21:58.013673800Z"
}, {
  "id" : "39266322-93fc-4519-a80b-cb3520b3a792",
  "title" : "Play Basketball",
  "description" : "Its good for kids to play",
  "status" : "PENDING",
  "category" : "Exercise",
  "assigneeId" : "a51eba5d-db11-4a35-99d2-e35b04796b88",
  "version" : 1,
  "createdAt" : "2025-10-25T22:28:44.566979600Z",
  "updatedAt" : "2025-10-25T22:28:44.566979600Z"
}, {
  "id" : "42278d48-2be8-4359-91a4-2f50bc4759a3",
  "title" : "Frontemd Development",
  "description" : "Develop and awesome TS Frontend",
  "status" : "PENDING",
  "category" : "School work",
  "assigneeId" : "6d6976bf-37aa-4a7c-8715-d92318f8c611",
  "version" : 1,
  "createdAt" : "2025-10-26T00:11:51.283427900Z",
  "updatedAt" : "2025-10-26T00:11:51.283427900Z"
} ]
  ```

  Admin can assign to any user. User must assign to self.

* `PUT /tasks/{id}`
  Body must include the last known `version`:

  ```json
  {
    "title": "Write final report",
    "description": "Q4 plan",
    "category": "Work",
    "assigneeId": "<user-or-self>",
    "status": "IN_PROGRESS",
    "version": 2
  }
  ```

* `PATCH /tasks/{id}/complete`
  Body: `{"version": 3}`
  Sets status to `DONE` if the version matches.

* `DELETE /tasks/{id}`
  Admin only. Returns 204 No Content.

### HTTP status codes used

* 200 OK on successful reads and updates that return a body
* 201 Created for creation if configured (or 200 OK if returning entity)
* 204 No Content on delete
* 400 Bad Request on validation errors
* 401 Unauthorized if login is required (optional depending on filter)
* 403 Forbidden on permission violations
* 404 Not Found for missing resources
* 409 Conflict on version mismatches

## Concurrency model

Optimistic concurrency is used. Each task has an integer `version`.

* Client sends the last known `version` in update or complete requests
* Server checks the current version and increments on success
* If versions differ the server returns 409 Conflict
* The frontend catches 409, reloads the latest list, and prompts a retry

## Frontend usage

* Login or signup at `/login.html`
* After login you are redirected to `/`
* Left pane lists users
* Middle pane lists tasks for the selected user
* Right pane shows task details for editing and completion
* Admin sees an assignee dropdown in the create form and a delete button in the detail view
* User can create and edit own tasks. Delete is not available

## Building TypeScript

Scripts are defined in `package.json`. Example:

```bash
npm run ts:build   # one-time build to static/js/*
npm run ts:watch   # rebuild on change during development
```

Ensure `index.html` imports the compiled ES modules from `static/js/`.

## Testing

### Postman

1. Login to get `{id, username, role}`
2. Use the returned `id` in `X-User-Id` header
3. Exercise `/users` and `/tasks` endpoints
4. Verify 409 by opening two edit sessions and saving with a stale version

### Browser

* Open two windows and edit the same task to see version conflict behavior
* Log in as ADMIN to verify full user list, creation for others, and delete
* Log in as USER to verify self-only behavior and missing delete control

## Security notes

* BCrypt password hashing via Spring Security crypto
* Role is derived on the server from the stored user record
* API returns public DTOs that exclude `passwordHash`
* Optional password policy and login attempt counter can be enabled in `AuthService`
* Never commit real credentials to the repository

## Common issues

* Missing `X-User-Id` header
  Add the header in Postman, or log in via `/login.html` so the browser includes it automatically.

* 409 Conflict on update
  The task changed on the server. Reload and retry with the new version.

* Empty response parsing crash
  The frontend request wrapper already tolerates empty bodies on 204. If you wrote custom fetch calls, use `res.text()` and parse JSON only when present.

### Note: The UI and backend integrates well so full application can be used and tested from UI.