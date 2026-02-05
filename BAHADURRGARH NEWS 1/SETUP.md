# 🚀 Bahadurgarh News - Setup Instructions

A professional, production-ready news website built with Node.js, Express, MongoDB, and Tailwind CSS.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd "BAHADURRGARH NEWS 1"

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bahadurgarh-news

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=5242880

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 4. Build CSS

```bash
# Build Tailwind CSS
npm run build:css

# Or watch for changes during development
npm run build:css -- --watch
```

### 5. Seed Database with Sample Data

```bash
# Run the seed script
node utils/seedData.js
```

This will create:
- 7 categories
- 4 users (admin, editor, 2 regular users)
- 6 sample articles
- 3 sample comments

**Default Login Credentials:**
- **Admin**: admin@bahadurgarhnews.com / admin123
- **Editor**: editor@bahadurgarhnews.com / editor123
- **User**: john@example.com / user123

### 6. Start the Development Server

```bash
# Start with nodemon (auto-restart on changes)
npm run dev

# Or start normally
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

## 📁 Project Structure

```
bahadurgarh-news/
├── public/                 # Static files
│   ├── css/             # Compiled CSS
│   ├── js/              # Client-side JavaScript
│   ├── images/          # Static images
│   └── uploads/         # User uploaded files
├── views/                 # EJS templates
│   ├── admin/           # Admin panel templates
│   ├── pages/           # Public page templates
│   └── partials/        # Reusable components
├── models/               # MongoDB models
├── routes/               # Express routes
├── middleware/           # Custom middleware
├── controllers/          # Route controllers
├── utils/                # Utility functions
├── config/               # Configuration files
└── server.js            # Main server file
```

## 🔧 Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Build CSS for production
npm run build:css

# Watch CSS changes during development
npm run build:css -- --watch

# Seed database with sample data
node utils/seedData.js
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:id` - Update article (auth required)
- `DELETE /api/articles/:id` - Delete article (admin required)
- `POST /api/articles/:id/views` - Increment views

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug

### Comments
- `GET /api/articles/:articleId/comments` - Get article comments
- `POST /api/comments` - Create comment (auth required)
- `POST /api/comments/:id/like` - Like comment (auth required)
- `POST /api/comments/:id/report` - Report comment (auth required)

### Search & Discovery
- `GET /api/search?q=query` - Search articles
- `GET /api/trending` - Get trending articles
- `GET /api/featured` - Get featured articles
- `GET /api/breaking-news` - Get breaking news

## 🎨 Frontend Features

### User Interface
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design inspired by NDTV
- **Dark/Light Mode**: Toggle between themes (future enhancement)
- **Accessibility**: WCAG 2.1 compliant
- **SEO Optimized**: Meta tags, structured data, sitemaps

### Interactive Features
- **Breaking News Ticker**: Real-time updates
- **Article Slider**: Auto-rotating featured stories
- **Search**: Live search with suggestions
- **Comments**: Nested comment system with likes
- **Social Sharing**: Share to Facebook, Twitter, WhatsApp
- **Newsletter**: Email subscription system

### User Features
- **Authentication**: Secure login/registration
- **User Profiles**: Personal dashboard
- **Saved Articles**: Bookmark functionality
- **Comment History**: Track user interactions
- **Preferences**: Customizable settings

## 🔐 Admin Panel Features

### Dashboard
- **Statistics**: Real-time analytics
- **Charts**: Visual data representation
- **Recent Activity**: Track latest changes
- **Quick Actions**: Common tasks shortcuts

### Content Management
- **Articles**: Full CRUD operations
- **Categories**: Manage news categories
- **Comments**: Moderate user comments
- **Media**: File upload and management
- **Bulk Actions**: Mass operations

### User Management
- **User Roles**: Admin, Editor, User
- **Permissions**: Role-based access control
- **User Profiles**: View and edit user data
- **Activity Logs**: Track user actions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Sanitize all inputs
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers
- **XSS Protection**: Prevent script injection

## 📊 Database Schema

### Articles
- Title, content, author, category
- Tags, status, featured flag
- Views, publish date, SEO meta
- Image URL, caption

### Users
- Name, email, password (hashed)
- Role, preferences, profile
- Saved articles, social links

### Categories
- Name, slug, description
- Color, icon, order
- Article count

### Comments
- Content, article, user
- Status, likes, reports
- Parent-child relationships

## 🚀 Deployment

### Production Setup

1. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-secret
   ```

2. **Build Assets**:
   ```bash
   npm run build:css
   ```

3. **Start Server**:
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build Docker image
docker build -t bahadurgarh-news .

# Run container
docker run -p 3000:3000 -e MONGODB_URI=your-mongodb-uri bahadurgarh-news
```

### Cloud Deployment (Heroku Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**:
   ```bash
   # Find process using port 3000
   netstat -tulpn | grep :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **CSS Not Building**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Authentication Issues**:
   - Check JWT_SECRET in `.env`
   - Verify token expiration settings
   - Clear browser cookies

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow Airbnb JavaScript style guide
- Add comments for complex logic
- Use meaningful variable names

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### API Documentation
- Use Swagger/OpenAPI for API docs
- Include request/response examples
- Document authentication requirements
- Add error response examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Email: support@bahadurgarhnews.com
- Check the [FAQ](docs/FAQ.md)

## 🔄 Updates & Maintenance

### Regular Tasks
- Update dependencies monthly
- Backup database regularly
- Monitor server logs
- Update security patches
- Review and optimize performance

### Version Updates
- Follow semantic versioning
- Maintain changelog
- Test thoroughly before release
- Document breaking changes

---

**🎉 Congratulations! Your Bahadurgarh News website is now ready!**

For any issues or questions, refer to the troubleshooting section or create an issue in the repository.
