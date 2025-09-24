# BioByte - A-Level Biology Learning Platform

BioByte is an online learning platform designed specifically for A-Level and IGCSE Biology students, providing high-quality educational resources and intelligent learning experiences.

## 🎯 Project Overview

BioByte is committed to making biology learning simpler, more efficient, and more engaging. We provide:

- **Free Learning Content**: Comprehensive coverage of all A-Level Biology chapters with detailed knowledge points
- **High-Quality Learning Resources**: Mind maps, syllabus analysis, video tutorials, and more
- **Intelligent Learning Assistant**: AI chatbot providing personalized learning support
- **User-Friendly Interface**: Modern responsive design supporting multiple devices
- **Multi-language Support**: Bilingual interface in English and Chinese

## 📚 Core Features

### Learning Resources
- **Chapter Content**: Complete coverage of 19 chapters with detailed knowledge points
- **Mind Maps**: Visual knowledge structures to help understand concept relationships
- **Syllabus Analysis**: Targeted analysis of exam focus points
- **Interactive Content**: Support for highlighting, note-taking, and other personalized learning features

### User System
- **Free Access**: Most learning content is freely available
- **User Registration**: Personal account management and learning progress tracking
- **Order Management**: Complete purchase and order history records

### Technical Features
- **Responsive Design**: Perfect adaptation for desktop and mobile devices
- **Real-time Search**: Quickly find needed learning content
- **Smart Customer Service**: 24/7 AI assistant to answer learning questions
- **Secure Payment**: Integration with PayPal and other payment methods

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 15 + React 19
- **Styling System**: Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Payment Integration**: PayPal API
- **AI Integration**: OpenAI API
- **Deployment**: Support for multiple deployment methods

## 📁 Project Structure

```
/
├── src/
│   ├── components/          # React components
│   │   ├── index/          # Homepage related components
│   │   ├── FloatUI/        # Floating UI components
│   │   └── ...
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API endpoints
│   │   ├── unit/           # Chapter pages
│   │   └── ...
│   ├── lib/                # Utility libraries and data
│   └── styles/             # Style files
├── output/                 # Learning content JSON files
├── uploads/                # Uploaded learning materials
├── public/                 # Static assets
└── context/                # React Context
```

## 🛠️ Environment Setup

1. Copy and configure environment variables:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=biobyte

# JWT secret
JWT_SECRET=your-jwt-secret

# PayPal API configuration (optional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret

# OpenAI API configuration (optional)
OPENAI_API_KEY=your-openai-api-key

# Application URL configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email configuration (optional)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

2. Install dependencies:

```bash
npm install
```

3. Initialize database:

Visit the `/api/create-tables` endpoint to automatically create the required database tables.

4. Start development server:

```bash
npm run dev
```

## 📊 Database Structure

Main data tables:

- `users` - User information
- `study_resources` - Learning resources
- `user_study_resources` - User purchase records
- `highlights` - User highlight notes

## 🔧 Main API Endpoints

### Learning Content Related
- `GET /api/getViewContent` - Get chapter content
- `GET /api/getResource` - Get resource information
- `GET /api/getRandomProducts` - Get recommended resources

### User Management
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/user` - Get user information
- `GET /api/orders` - Get order history

### Payment System
- `POST /api/paypal/create-order` - Create order
- `POST /api/paypal/capture-order` - Capture payment
- `POST /api/paypal/webhook` - Payment callback

### Smart Features
- `POST /api/chat` - AI chatbot
- `POST /api/highlights` - Save/get highlight notes

## 🎨 Design Philosophy

BioByte adopts a modern minimalist design style with a focus on user experience:

- **Intuitive Navigation**: Clear information architecture and navigation structure
- **Visual Hierarchy**: Reasonable visual hierarchy and information organization
- **Interactive Feedback**: Smooth interaction animations and user feedback
- **Accessibility Design**: Considering the usage needs of different users

## 🔮 Future Plans

- **AI Tutor Features**: More intelligent personalized learning guidance
- **Learning Progress Tracking**: Detailed learning analysis and progress management
- **Community Features**: Student communication and discussion platform
- **Mobile Application**: Native mobile app development
- **More Subjects**: Expansion to other A-Level subjects

## 📝 Development Notes

This project is transitioning from a paid resource purchasing platform to a free online learning platform, aiming to provide high-quality free educational resources to more students while retaining some premium features as paid options.

## 🤝 Contributing Guidelines

Contributions and suggestions are welcome! Please follow these steps:

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact Us

- Email: biomindbot@gmail.com
- Website: [BioByte Official Site](https://biobyte.shop)

---

*Making biology learning simpler and more engaging!* 🧬
