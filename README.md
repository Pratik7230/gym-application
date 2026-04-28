# Gym Management Application

A comprehensive full-stack gym management system built with **Next.js 16**, **MongoDB**, and **Razorpay**. This application enables gyms to manage memberships, track attendance, process payments, assign trainers, and deliver digital workout content.

## 📋 Features

### **Admin Dashboard**
- 👥 **Member Management** - Add, edit, and manage gym members
- 💳 **Subscription Plans** - Create and configure membership plans
- 📊 **Subscription Tracking** - Monitor active and expired subscriptions
- 💰 **Payment Management** - Track and manage Razorpay transactions
- 📋 **Attendance Logs** - View detailed attendance records
- 🎬 **Video Tutorials** - Upload and manage training videos
- 📤 **Data Export** - Export analytics and member data
- 📊 **Analytics Dashboard** - View key metrics and statistics
- 🔔 **Activity Logs** - Audit trail of admin actions

### **Client Portal**
- 🏋️ **Active Subscriptions** - View current subscription status and renewal dates
- 📱 **Attendance Tracking** - Check in using QR codes
- 🎥 **Workout Programs** - Access personalized workout plans
- 💳 **Payment Processing** - Purchase memberships and renew subscriptions
- 👤 **Profile Management** - Update personal information and profile picture
- 📺 **Video Library** - Stream training videos and tutorials

### **Trainer Portal**
- 👥 **Client Management** - View assigned clients
- 🏋️ **Workout Programs** - Create and manage personalized workout plans for clients
- 📊 **Client Tracking** - Monitor client progress and engagement

### **Authentication & Security**
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔄 **Refresh Token System** - Extended session management
- 📧 **Email Verification** - Secure signup with email confirmation
- 🔑 **Password Reset** - Forgot password flow with email recovery
- ⏱️ **Rate Limiting** - Upstash Redis-based API rate limiting
- 🛡️ **Role-Based Access** - Admin, Trainer, and Client roles

### **Payments & Billing**
- 💳 **Razorpay Integration** - Secure payment processing
- 📧 **Subscription Reminders** - Automated email notifications for renewals
- 📆 **Scheduled Cron Jobs** - Daily reminder emails at 9:00 AM UTC

### **Additional Features**
- 🌓 **Dark Mode Support** - Dark and light theme toggle
- 📸 **Avatar Upload** - Cloudinary-based profile photo storage
- 📊 **QR Code Attendance** - Scan-based check-in system
- 🔗 **SSO-Ready** - Session management across tabs
- 📱 **Responsive Design** - Mobile-first Tailwind CSS design

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** Atlas account or local MongoDB instance
- **Razorpay** account (for payment processing)
- **SMTP** credentials (for email notifications)
- **Cloudinary** account (optional, for avatar uploads)
- **Upstash Redis** (optional but recommended for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following variables in `.env.local`:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_ACCESS_SECRET` - Random secret for access tokens
   - `JWT_REFRESH_SECRET` - Random secret for refresh tokens
   - `CRON_SECRET` - Secret for cron job protection
   - `NEXT_PUBLIC_APP_URL` - Your application URL
   - `RAZORPAY_KEY_ID` - Razorpay API key
   - `RAZORPAY_KEY_SECRET` - Razorpay API secret
   - `SMTP_*` / `EMAIL_FROM` - Email credentials (optional)
   - `CLOUDINARY_*` - Cloudinary API keys (optional)
   - `UPSTASH_REDIS_*` - Redis credentials (optional, for production)

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
gym-application/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes (authentication, payments, etc.)
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── client/          # Client portal pages
│   │   ├── trainer/         # Trainer portal pages
│   │   └── auth/            # Login, signup, password recovery
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and helpers
│   │   ├── auth/            # Authentication logic
│   │   ├── db.js            # MongoDB connection
│   │   └── errors.js        # Error handling
│   ├── models/              # MongoDB Mongoose schemas
│   ├── services/            # Business logic services
│   ├── validators/          # Input validation with Zod
│   └── constants/           # Application constants
├── public/                  # Static assets
├── DEPLOYMENT.md            # Deployment guide
└── package.json             # Dependencies
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, next-themes |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (jose), bcryptjs |
| **Payments** | Razorpay SDK |
| **Email** | Nodemailer |
| **QR Codes** | qrcode library |
| **Rate Limiting** | Upstash Redis & @upstash/ratelimit |
| **File Storage** | Vercel Blob / Cloudinary |
| **Deployment** | Vercel |
| **Styling** | Tailwind CSS 4 with PostCSS |

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 📚 API Routes

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset

### **Admin**
- `GET/POST /api/admin/members` - Manage gym members
- `GET/POST /api/admin/plans` - Manage subscription plans
- `GET/POST /api/admin/subscriptions` - Manage subscriptions
- `GET/POST /api/admin/payments` - Track payments
- `GET /api/admin/attendance` - View attendance logs
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/activity-logs` - View activity audit logs

### **Client**
- `GET /api/client/subscription` - Get subscription details
- `POST /api/client/payments` - Create payment orders
- `GET /api/client/workouts` - Get assigned workouts
- `POST /api/client/attendance/check-in` - Log attendance

### **Payments**
- `POST /api/razorpay/order` - Create Razorpay order
- `POST /api/razorpay/webhook` - Handle Razorpay webhooks

### **Cron Jobs**
- `GET /api/cron/subscription-reminders` - Daily subscription renewal reminders

## 🚀 Deployment

### Deploy on Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy

**Key Environment Variables:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` - JWT secret
- `CRON_SECRET` - Cron job protection secret
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment processing
- `UPSTASH_REDIS_URL` - Production rate limiting (recommended)

### Post-Deployment Testing
1. Visit `/` and sign up as first user (admin role)
2. Create a subscription plan
3. Create a member and subscription
4. Test payment flow with Razorpay test keys
5. Verify attendance QR code scanning

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ Secure JWT token management
- ✅ CSRF protection via middleware
- ✅ Rate limiting on sensitive endpoints
- ✅ Email verification for signups
- ✅ Secure password reset flow
- ✅ Role-based access control
- ✅ Session refresh without re-login

## 📖 Documentation

For additional documentation, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment configuration and environment variables
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [MongoDB Documentation](https://docs.mongodb.com/) - Database documentation
- [Razorpay Documentation](https://razorpay.com/docs) - Payment integration guide

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 🆘 Support

For issues, feature requests, or questions, please contact the development team.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
