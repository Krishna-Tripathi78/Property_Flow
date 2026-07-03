# PropertyFlow - Modern Society Maintenance Tracker

A comprehensive platform for managing apartment society maintenance complaints with role-based authentication, photo uploads, overdue detection, notice board, and email notifications.

![PropertyFlow](https://img.shields.io/badge/PropertyFlow-Society%20Management-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🚀 Features

### For Residents
- **User Registration & Authentication** - Secure login with JWT tokens
- **Create Complaints** - Submit maintenance complaints with categories, descriptions, and photo attachments
- **Track Progress** - View complaint status history and real-time updates
- **Notice Board** - Stay informed with society announcements and important notices
- **Email Notifications** - Receive automatic updates when complaint status changes

### For Administrators
- **Admin Dashboard** - Comprehensive overview with statistics and charts
- **Complaint Management** - View, filter, and update all complaints with priority settings
- **Overdue Detection** - Automatic flagging of complaints past due dates based on priority
- **User Management** - Activate/deactivate resident accounts
- **Notice Management** - Create and manage society notices with importance levels
- **Email System** - Automatic email notifications for status changes and important notices

### Technical Features
- **Role-based Access Control** - Separate interfaces for residents and admins
- **Photo Upload** - Cloudinary integration for complaint photo attachments
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Updates** - Live status tracking and notifications
- **Search & Filters** - Advanced filtering by status, category, priority, and date
- **Pagination** - Efficient handling of large datasets

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Multer + Cloudinary** - File upload and storage
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework with hooks
- **React Router v6** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for photo uploads)
- Gmail account with App Password (for email notifications)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd society-maintenance-tracker
```

### 2. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/society-tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (for photo uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password

# Application Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 4. Setup Services

#### MongoDB Setup
- Install MongoDB locally or create a MongoDB Atlas cluster
- Update the `MONGODB_URI` in your `.env` file

#### Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env` file

#### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this App Password in your `.env` file

### 5. Start the Application

```bash
# Start the server (from root directory)
npm run dev

# In another terminal, start the client
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 Default User Accounts

For testing purposes, you can create accounts with these roles:

### Admin Account
- Email: admin@demo.com
- Password: password123
- Role: Admin

### Resident Account
- Email: resident@demo.com
- Password: password123
- Role: Resident
- Apartment: A-101

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user (resident or admin)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "resident",
  "apartmentNumber": "A-101",
  "phoneNumber": "1234567890"
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication)

### Complaint Endpoints

#### GET /api/complaints
Get complaints (filtered by user role)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (Open, In Progress, Resolved)
- `category` - Filter by category
- `priority` - Filter by priority (Low, Medium, High)
- `dateFrom` - Filter from date
- `dateTo` - Filter to date

#### POST /api/complaints
Create a new complaint (residents only)

**Request Body (multipart/form-data):**
- `title` - Complaint title
- `description` - Complaint description
- `category` - Complaint category
- `photos` - Photo files (optional, max 5)

#### GET /api/complaints/:id
Get complaint by ID

#### PUT /admin/complaints/:id
Update complaint (admin only)

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "note": "Working on this issue",
  "assignedTo": "admin-user-id"
}
```

### Notice Endpoints

#### GET /api/notices
Get all notices

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `category` - Filter by category

#### POST /api/notices
Create a notice (admin only)

**Request Body:**
```json
{
  "title": "Notice Title",
  "content": "Notice content",
  "category": "General",
  "isImportant": true,
  "expiresAt": "2024-12-31"
}
```

#### PUT /api/notices/:id
Update a notice (admin only)

#### DELETE /api/notices/:id
Delete a notice (admin only)

### Admin Endpoints

#### GET /admin/dashboard/stats
Get dashboard statistics (admin only)

#### GET /admin/users
Get all users (admin only)

#### PUT /admin/users/:id/status
Update user status (admin only)

**Request Body:**
```json
{
  "isActive": true
}
```

## 🗄 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (resident|admin),
  apartmentNumber: String (required for residents),
  phoneNumber: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Schema
```javascript
{
  title: String,
  description: String,
  category: String (enum),
  status: String (Open|In Progress|Resolved),
  priority: String (Low|Medium|High),
  resident: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  photos: [{ url: String, publicId: String }],
  history: [{
    status: String,
    changedBy: ObjectId (ref: User),
    note: String,
    timestamp: Date
  }],
  isOverdue: Boolean,
  dueDate: Date,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notice Schema
```javascript
{
  title: String,
  content: String,
  author: ObjectId (ref: User),
  isImportant: Boolean,
  isPinned: Boolean,
  isActive: Boolean,
  category: String (enum),
  expiresAt: Date,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
CLIENT_URL=https://your-frontend-domain.com
```

### Deploy to Vercel (Frontend)

1. Build the client:
```bash
cd client
npm run build
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

### Deploy to Railway/Render (Backend)

1. Create a new project on Railway or Render
2. Connect your GitHub repository
3. Set environment variables in the dashboard
4. The app will automatically build and deploy

### Deploy Full Stack to Railway

Create `railway.toml` in root:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"

[[services]]
name = "backend"
source = "."
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start server with nodemon
npm run client       # Start React client
npm run server       # Start server only

# Production
npm start           # Start server in production
npm run build       # Build client for production
```

### Code Structure

```
society-maintenance-tracker/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
├── middleware/            # Express middleware
├── models/               # MongoDB models
├── routes/               # Express routes
├── utils/                # Utility functions
├── server.js             # Express server
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- Built with modern web technologies
- Inspired by the need for efficient society management
- Thanks to all contributors and users

## 📞 Support

If you have any questions or need help with setup:

1. Check the [Issues](https://github.com/yourusername/propertyflow/issues) page
2. Create a new issue if your problem isn't already reported
3. Follow the issue templates for better assistance

## 🚀 Deployment

Ready for deployment on:
- **Frontend**: Vercel, Netlify, AWS S3
- **Backend**: Railway, Render, Heroku, AWS EC2
- **Database**: MongoDB Atlas, AWS DocumentDB

## 📈 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Multi-tenant support
- [ ] Integration with payment gateways
- [ ] WhatsApp notifications
- [ ] Document management system

---

**Made with ❤️ for better society management**

## 🐛 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection issues
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify your IP is whitelisted in MongoDB Atlas
- Check your network connectivity

#### Email notifications not working
- Verify Gmail App Password is correctly generated and added to `.env`
- Check that 2FA is enabled on your Gmail account
- Ensure EMAIL_USER and EMAIL_PASS are correct

#### Photo uploads failing
- Verify Cloudinary credentials in `.env`
- Check Cloudinary dashboard for API usage limits
- Ensure file size is under 5MB limit

#### Build errors
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
cd client && npm install
```

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] WhatsApp notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-society support
- [ ] Maintenance staff assignment
- [ ] Payment integration for services
- [ ] Document management system