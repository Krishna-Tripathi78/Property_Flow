# PropertyFlow

Society maintenance tracking system for apartment complexes.

## Setup

1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Create `.env` file:
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

3. Start the application:
```bash
npm run dev
cd client && npm start
```

## Features

- User authentication
- Complaint management with photos
- Admin dashboard
- Notice board
- Email notifications

## Tech Stack

- Backend: Node.js, Express, MongoDB
- Frontend: React, Tailwind CSS
- File Storage: Cloudinary
- Email: Nodemailer