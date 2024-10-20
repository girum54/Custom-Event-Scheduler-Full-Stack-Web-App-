# Custom Event Scheduler Frontend

Frontend Setup

## Table of Contents

- Installation
- Usage
- Components
- Routes
- Contributing

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/girum54/Custom-Event-Scheduler-Full-Stack-Web-App-.git
   cd Custom-Event-Scheduler-Full-Stack-Web-App-/backend
   ```

## Install dependencies:

npm install

## Usage

Start the development server:
npm start

The application will be running on http://localhost:3000.

## Components

UserAuth
Handles user authentication (login and registration).

EventForm
Form for adding and editing events.

UpcomingEvents
Displays a list of upcoming events.

ViewAllEvents
Calendar view to display all events.

SearchEvents
Allows users to search for events.

Navbar
Navigation bar with links to different sections of the application.

Routes
-/addevent: Route to add a new event.
-/editevent/:eventId: Route to edit an existing event.
-/upcomingevents: Route to view upcoming events.
-/viewallevents: Route to view all events in a calendar.
-/searchevents: Route to search for events.
-/: Default route redirects to /upcomingevents.

## Fork the repository.

Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m 'Add some feature').
Push to the branch (git push origin feature-branch).
Open a pull request.
