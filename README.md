# Tidewy - Beach Cleanup Platform

A comprehensive full-stack web application for organizing and managing beach cleanup events with volunteer engagement and gamification features.

## 🌊 Features

### For Volunteers
- **Event Discovery**: Browse and register for beach cleanup events
- **Real-time Participation**: Join live events with QR code scanning
- **Impact Tracking**: Monitor personal contribution metrics
- **Gamification**: Earn AquaCoins and unlock achievements
- **Rewards Store**: Redeem coins for merchandise and experiences
- **Profile Management**: Track progress and view statistics

### For NGOs
- **Event Management**: Create, update, and manage cleanup events
- **Volunteer Coordination**: Track registrations and attendance
- **Impact Analytics**: Monitor waste collection and beach health scores
- **Communication Tools**: Engage with volunteer community

### Technical Features
- **Authentication**: JWT-based secure login/registration
- **Real-time Updates**: Live event status and participation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Database Integration**: MongoDB with comprehensive schemas
- **API Architecture**: RESTful endpoints with validation
- **Error Handling**: Comprehensive error management

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd tidewy-platform
npm run install:all
```

2. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Update MongoDB connection string and other variables
# MONGODB_URI=mongodb://localhost:27017/tidewy
# JWT_SECRET=your-super-secret-jwt-key
```

3. **Start Development Servers**
```bash
# Run both client and server concurrently
npm run dev

# Or run separately
npm run client:dev  # Frontend on http://localhost:5173
npm run server:dev  # Backend on http://localhost:3001
```

## 📁 Project Structure

```
tidewy-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   │   ├── volunteer/  # Volunteer-specific pages
│   │   │   └── ngo/        # NGO-specific pages
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── server.ts       # Server entry point
│   └── package.json
├── .env                    # Environment variables
└── package.json           # Root package.json
```

## 🗄️ Database Schemas

### Core Models
- **User**: Volunteer and NGO profiles with role-based fields
- **Event**: Beach cleanup events with status tracking
- **Attendance**: QR-based check-in/check-out records
- **WasteLog**: Waste collection data with geolocation
- **BeachHealthScore**: ML-calculated beach health metrics

### Gamification Models
- **Reward**: AquaStore items and experiences
- **Achievement**: Milestone tracking and NFT integration
- **Leaderboard**: Cached ranking system

### Analytics Models
- **ChatLog**: AI chatbot interaction history
- **EmailTemplate**: Automated communication templates

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - List events with filters
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (NGO only)
- `POST /api/events/:id/register` - Register for event
- `PUT /api/events/:id` - Update event (NGO only)
- `DELETE /api/events/:id` - Delete event (NGO only)

### Rewards
- `GET /api/rewards` - List rewards
- `GET /api/rewards/:id` - Get reward details
- `POST /api/rewards/:id/redeem` - Redeem reward

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/volunteers` - List volunteers (NGO)
- `GET /api/users/stats` - Get user statistics

## 🎨 Design System

### Colors
- **Primary**: Ocean blue (#0ea5e9 to #0c4a6e)
- **Ocean**: Teal accent (#14b8a6 to #134e4a)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Height**: 150% body, 120% headings

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary/secondary variants with hover states
- **Forms**: Consistent input styling with validation
- **Navigation**: Clean sidebar with active states

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request handling
- **Helmet**: Security headers
- **Input Validation**: Server-side validation with express-validator

## 🚀 Deployment

### Production Build
```bash
# Build both client and server
npm run client:build
npm run server:build

# Start production servers
npm start
```

### Environment Variables (Production)
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tidewy
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Future Enhancements

### Planned Features
- **Mobile App**: React Native implementation
- **AI Integration**: LangChain chatbot and D-ID avatars
- **Blockchain**: NFT achievements and token rewards
- **ML Analytics**: Beach health scoring algorithms
- **Real-time Chat**: Event communication system
- **Payment Integration**: Donation and premium features

### Technical Improvements
- **Microservices**: Service decomposition
- **Caching**: Redis implementation
- **CDN**: Asset delivery optimization
- **Monitoring**: Application performance tracking
- **CI/CD**: Automated deployment pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pexels**: Stock photography for UI mockups
- **Lucide React**: Beautiful icon library
- **Tailwind CSS**: Utility-first CSS framework
- **MongoDB**: Flexible document database
- **Express.js**: Fast web framework for Node.js

---

**Built with ❤️ for ocean conservation**

For questions or support, please open an issue or contact the development team.