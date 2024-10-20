# Custom Event Scheduler Backend

API and Backend Setup

## Table of Contents

- Installation
- Usage
- API Endpoints
- Configuration
- Contributing

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/girum54/Custom-Event-Scheduler-Full-Stack-Web-App-.git
   cd Custom-Event-Scheduler-Full-Stack-Web-App-/backend
   ```

## Install dependencies:

    - npm install

Set up environment variables: Create a .env file in the root directory and add the necessary environment variables. For example:
PORT=5001
DATABASE_URL=mongodb://localhost:27017/event-scheduler
JWT_SECRET=the_secret

## Usage

Start the server: with nodemon

    - npm run start

The server will be running on http://localhost:5001.

## API Endpoints

- Authentication
  POST "http://localhost:5001/api/users/register"
  Registers a new user.
  Request body:
  JSON
  {
  "username": "user123",
  "password": "password123"
  }

- Events
  GET http://localhost:5001/api/events
  Retrieves a list of events.
  Headers: Authorization: Bearer <token>
  POST http://localhost:5001/api/events
  Creates a new event.
  Headers: Authorization: Bearer <token>
  Request body:
  JSON
  {
  "title": "Event Title",
  "startDate": "2024-10-20T10:00:00Z",
  "endDate": "2024-10-20T12:00:00Z",
  "details": "Event details",
  "recurrenceRule": "RRULE:FREQ=WEEKLY;BYDAY=MO"
  "recurrenceType": "relative-date"
  }

PUT http://localhost:5001/api/events/eventId
-Updates an existing event.
-Headers: Authorization: Bearer <token>
-Request body:
JSON
{
"title": "Updated Event Title",
"startDate": "2024-10-21T10:00:00Z",
"endDate": "2024-10-21T12:00:00Z",
"details": "Event details",
"recurrenceRule": "RRULE:FREQ=MONTHLY;BYDAY=1MO"
"recurrenceType": "relative-date"
}

DELETE http://localhost:5001/api/events/eventId
Deletes an event.
Headers: Authorization: Bearer <token>

## Configuration

PORT: The port number on which the server will run.
DATABASE_URL: The URL of the MongoDB database.
JWT_SECRET: The secret key for signing JWT tokens.

## Contributing

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m 'Add some feature').
Push to the branch (git push origin feature-branch).
Open a pull request.
