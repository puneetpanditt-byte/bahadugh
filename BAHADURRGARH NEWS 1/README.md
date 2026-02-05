# Bahadurgarh News - Professional News Website

A production-ready news website inspired by NDTV with full-stack functionality.

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Features

### Frontend
- Responsive design (Mobile-First)
- Breaking news ticker
- Featured news slider
- Category-based news sections
- User authentication
- Social sharing

### Admin Panel
- Secure admin login
- Article management (CRUD)
- Category management
- User management
- Role-based access control

### User Panel
- User registration & login
- Profile management
- Saved articles
- Comment system

## Project Structure

```
bahadurgarh-news/
├── public/
│   ├── css/
│   │   ├── input.css
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── admin.js
│   │   └── auth.js
│   ├── images/
│   └── uploads/
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── navbar.ejs
│   ├── pages/
│   │   ├── index.ejs
│   │   ├── article.ejs
│   │   ├── category.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── profile.ejs
│   └── admin/
│       ├── dashboard.ejs
│       ├── articles.ejs
│       ├── categories.ejs
│       └── users.ejs
├── models/
│   ├── Article.js
│   ├── User.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── articles.js
│   ├── admin.js
│   └── api.js
├── middleware/
│   ├── auth.js
│   ├── admin.js
│   └── upload.js
├── config/
│   ├── database.js
│   └── config.js
├── controllers/
│   ├── authController.js
│   ├── articleController.js
│   └── adminController.js
├── utils/
│   ├── helpers.js
│   └── validators.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Steps

1. **Clone and install dependencies**
```bash
cd "BAHADURRGARH NEWS 1"
npm install
```

2. **Environment Setup**
Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bahadurgarh-news
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
UPLOAD_PATH=./public/uploads
```

3. **Database Setup**
```bash
# Start MongoDB service
mongod
```

4. **Build CSS**
```bash
npm run build:css
```

5. **Start Development Server**
```bash
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## Default Admin Credentials

- **Email**: admin@bahadurgarhnews.com
- **Password**: admin123

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### Articles
- GET `/api/articles` - Get all articles
- GET `/api/articles/:id` - Get single article
- POST `/api/articles` - Create article (Admin)
- PUT `/api/articles/:id` - Update article (Admin)
- DELETE `/api/articles/:id` - Delete article (Admin)

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create category (Admin)
- PUT `/api/categories/:id` - Update category (Admin)
- DELETE `/api/categories/:id` - Delete category (Admin)

## Features Details

### Role-Based Access Control
- **Admin**: Full access to all features
- **Editor**: Can create/edit articles
- **User**: Can read articles, save, comment

### Security Features
- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- Input validation
- XSS protection
- CSRF protection

### Performance
- Lazy loading images
- Optimized CSS with Tailwind
- Efficient database queries
- Caching strategies

## Deployment

### For Production
1. Set environment variables
2. Build CSS: `npm run build:css`
3. Start server: `npm start`

### Docker Deployment
```bash
docker build -t bahadurgarh-news .
docker run -p 3000:3000 bahadurgarh-news
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@bahadurgarhnews.com
