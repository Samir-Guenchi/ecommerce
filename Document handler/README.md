# Document Handler

A simple web interface for managing seller registration documents and approvals.

## Features

- View all seller registrations with their verification status
- Display uploaded documents (up to 3 documents per registration)
- Approve or reject seller registrations based on document review
- Real-time status updates

## Setup

1. Ensure the backend is running on `http://localhost:3000`
2. Open `index.html` in a web browser
3. Update the `AUTH_TOKEN` variable in the script with a valid admin JWT token

## API Endpoints Used

- `GET /api/seller-registrations` - Fetch all registrations
- `PUT /api/seller-registrations/:id/approve` - Approve registration
- `PUT /api/seller-registrations/:id/reject` - Reject registration

## Document Access

Documents are assumed to be served from `/uploads/` path on the backend.
Update the `getDocumentUrl` function if your document storage differs.