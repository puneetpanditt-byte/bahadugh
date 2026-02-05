const mongoose = require('mongoose');
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
require('dotenv').config();

// Sample data
const sampleCategories = [
    { name: 'India', slug: 'india', color: '#FF6B6B', icon: 'fas fa-flag', order: 1 },
    { name: 'World', slug: 'world', color: '#4ECDC4', icon: 'fas fa-globe', order: 2 },
    { name: 'Business', slug: 'business', color: '#45B7D1', icon: 'fas fa-briefcase', order: 3 },
    { name: 'Sports', slug: 'sports', color: '#96CEB4', icon: 'fas fa-football-ball', order: 4 },
    { name: 'Entertainment', slug: 'entertainment', color: '#FFEAA7', icon: 'fas fa-film', order: 5 },
    { name: 'Technology', slug: 'technology', color: '#DDA0DD', icon: 'fas fa-microchip', order: 6 },
    { name: 'Health', slug: 'health', color: '#98D8C8', icon: 'fas fa-heartbeat', order: 7 }
];

const sampleArticles = [
    {
        title: "Breaking: Major Policy Announcement by Government",
        shortDescription: "Government announces comprehensive economic reform package to boost growth and employment across sectors",
        content: `
            <p>In a landmark announcement today, the government unveiled a comprehensive economic reform package aimed at stimulating growth and creating employment opportunities across various sectors of the economy.</p>
            
            <h3>Key Highlights of the Reform Package</h3>
            <p>The reform package includes several key initiatives designed to address both immediate economic challenges and long-term structural issues. Finance Minister announced a series of measures that will be implemented over the next 12 months.</p>
            
            <h3>Impact on Various Sectors</h3>
            <p>The reforms are expected to have far-reaching implications for multiple sectors including manufacturing, services, agriculture, and technology. Industry experts have welcomed the move as a positive step towards economic recovery.</p>
            
            <h3>Expert Reactions</h3>
            <p>Economists and industry leaders have largely welcomed the announcement, though some have called for more detailed implementation plans. The stock market reacted positively to the news, with major indices gaining significant points.</p>
            
            <h3>Next Steps</h3>
            <p>The government will begin implementing these reforms starting next month, with detailed guidelines to be released in the coming weeks. Stakeholders are encouraged to provide feedback during the implementation phase.</p>
        `,
        author: "Senior Correspondent",
        category: "india",
        tags: ["politics", "economy", "government", "reform"],
        status: "published",
        featured: true,
        breakingNews: true,
        imageUrl: "https://via.placeholder.com/800x450/FF6B6B/FFFFFF?text=Government+Policy+Announcement",
        imageCaption: "Finance Minister announcing the new economic reforms",
        publishDate: new Date(),
        views: 1250
    },
    {
        title: "Technology Giants Announce Major AI Investment in India",
        shortDescription: "Leading technology companies pledge billions in investment for AI research and development centers across the country",
        content: `
            <p>In a significant development for India's technology sector, several global technology giants have announced massive investments in artificial intelligence research and development centers across the country.</p>
            
            <h3>Investment Details</h3>
            <p>The combined investment from these companies is expected to exceed $10 billion over the next five years, creating thousands of high-skilled jobs and positioning India as a global AI hub.</p>
            
            <h3>Strategic Importance</h3>
            <p>This investment comes as part of a broader strategy to leverage India's talent pool and growing digital infrastructure. The centers will focus on developing AI solutions for global and local markets.</p>
            
            <h3>Government Support</h3>
            <p>The government has welcomed these investments and announced supportive policies including tax incentives and streamlined regulatory processes for AI research and development.</p>
        `,
        author: "Tech Editor",
        category: "technology",
        tags: ["technology", "AI", "investment", "innovation"],
        status: "published",
        featured: true,
        breakingNews: false,
        imageUrl: "https://via.placeholder.com/800x450/DDA0DD/FFFFFF?text=AI+Investment+Announcement",
        imageCaption: "AI technology visualization",
        publishDate: new Date(Date.now() - 3600000),
        views: 890
    },
    {
        title: "National Cricket Team Wins Thrilling Match Against Australia",
        shortDescription: "India secures dramatic victory in the final over to level the series 1-1",
        content: `
            <p>In a nail-biting finish at the Melbourne Cricket Ground, the Indian national cricket team secured a thrilling 4-wicket victory against Australia in the second T20 match.</p>
            
            <h3>Match Highlights</h3>
            <p>Chasing a challenging target of 185 runs, India achieved the victory with just 2 balls to spare, thanks to a brilliant cameo by the middle-order batsman who scored 45 runs off just 22 deliveries.</p>
            
            <h3>Key Performances</h3>
            <p>The Indian bowlers set up the victory with a disciplined performance, restricting Australia to a competitive total. The young pacer was particularly impressive, taking 3 wickets for just 28 runs in his 4 overs.</p>
            
            <h3>Series Status</h3>
            <p>With this victory, India has leveled the 3-match series 1-1. The deciding match will be played in Sydney on Sunday, with both teams looking to secure the series victory.</p>
        `,
        author: "Sports Correspondent",
        category: "sports",
        tags: ["cricket", "national team", "australia", "victory"],
        status: "published",
        featured: false,
        breakingNews: false,
        imageUrl: "https://via.placeholder.com/800x450/96CEB4/FFFFFF?text=Cricket+Victory",
        imageCaption: "Indian cricket team celebrating victory",
        publishDate: new Date(Date.now() - 7200000),
        views: 2100
    },
    {
        title: "Global Climate Summit Reaches Historic Agreement",
        shortDescription: "World leaders commit to ambitious new targets for carbon reduction and renewable energy adoption",
        content: `
            <p>After two weeks of intense negotiations, world leaders at the Global Climate Summit have reached a historic agreement on climate action, committing to unprecedented targets for carbon reduction.</p>
            
            <h3>Agreement Details</h3>
            <p>The agreement includes binding commitments from 195 countries to reduce carbon emissions by 45% by 2030 and achieve net-zero emissions by 2050.</p>
            
            <h3>Financial Commitments</h3>
            <p>Developed nations have pledged $100 billion annually to help developing countries transition to renewable energy and adapt to climate change impacts.</p>
            
            <h3>Implementation Mechanisms</h3>
            <p>The agreement establishes a robust monitoring and verification system to ensure countries meet their commitments, with penalties for non-compliance.</p>
        `,
        author: "International Affairs Editor",
        category: "world",
        tags: ["climate", "environment", "summit", "agreement"],
        status: "published",
        featured: true,
        breakingNews: false,
        imageUrl: "https://via.placeholder.com/800x450/4ECDC4/FFFFFF?text=Climate+Summit+Agreement",
        imageCaption: "World leaders at the climate summit",
        publishDate: new Date(Date.now() - 10800000),
        views: 1560
    },
    {
        title: "Bollywood Blockbreaker Crosses 500 Crore Mark Worldwide",
        shortDescription: "Latest release becomes the highest-grossing Indian film of all time, breaking multiple box office records",
        content: `
            <p>The latest Bollywood blockbuster has achieved a remarkable milestone, crossing the 500 crore mark worldwide within just three weeks of its release.</p>
            
            <h3>Box Office Performance</h3>
            <p>The film has shattered multiple box office records, including the highest opening weekend collection and fastest to reach 100, 200, 300, 400, and now 500 crore marks.</p>
            
            <h3>Audience Reception</h3>
            <p>Critics and audiences alike have praised the film for its storytelling, performances, and technical excellence. Social media has been flooded with positive reviews and fan reactions.</p>
            
            <h3>International Success</h3>
            <p>The film has performed exceptionally well in international markets, particularly in the United States, United Kingdom, and Middle East, contributing significantly to its worldwide total.</p>
        `,
        author: "Entertainment Editor",
        category: "entertainment",
        tags: ["bollywood", "box office", "film", "records"],
        status: "published",
        featured: false,
        breakingNews: false,
        imageUrl: "https://via.placeholder.com/800x450/FFEAA7/FFFFFF?text=Bollywood+Blockbuster",
        imageCaption: "Movie poster of the blockbuster film",
        publishDate: new Date(Date.now() - 14400000),
        views: 3200
    },
    {
        title: "Stock Market Reaches All-Time High, Investor Confidence Soars",
        shortDescription: "Sensex and Nifty hit record levels as foreign institutional investors pour money into Indian markets",
        content: `
            <p>Indian stock markets reached unprecedented heights today, with both Sensex and Nifty hitting all-time record levels amid strong foreign institutional investment.</p>
            
            <h3>Market Performance</h3>
            <p>The BSE Sensex surged over 800 points to close at an all-time high of 65,432, while the NSE Nifty gained 240 points to close at 19,567.</p>
            
            <h3>Sectoral Performance</h3>
            <p>All major sectors contributed to the rally, with banking, IT, and auto stocks leading the gains. Mid-cap and small-cap indices also showed strong performance.</p>
            
            <h3>Foreign Investment</h3>
            <p>Foreign institutional investors (FIIs) have been net buyers throughout the month, investing over $5 billion in Indian equities, showing strong confidence in the Indian economy.</p>
        `,
        author: "Business Editor",
        category: "business",
        tags: ["stock market", "investments", "economy", "finance"],
        status: "published",
        featured: true,
        breakingNews: false,
        imageUrl: "https://via.placeholder.com/800x450/45B7D1/FFFFFF?text=Stock+Market+High",
        imageCaption: "Stock market trading screen showing record highs",
        publishDate: new Date(Date.now() - 18000000),
        views: 980
    },
    {
        title: "Revolutionary Health Breakthrough: New Treatment Shows Promise for Diabetes",
        shortDescription: "Medical researchers announce groundbreaking treatment that could potentially reverse type 2 diabetes",
        content: `
            <p>In a major medical breakthrough, researchers have announced a new treatment that shows promising results in potentially reversing type 2 diabetes, offering hope to millions worldwide.</p>
            
            <h3>Research Details</h3>
            <p>The treatment, developed after years of research, combines a novel drug therapy with lifestyle modifications and has shown remarkable results in clinical trials.</p>
            
            <h3>Clinical Trial Results</h3>
            <p>In phase 3 clinical trials involving over 1,000 patients, 78% of participants achieved normal blood sugar levels without medication after 12 months of treatment.</p>
            
            <h3>Medical Community Response</h3>
            <p>The medical community has greeted this news with cautious optimism, with experts calling for larger-scale trials to confirm the findings before widespread adoption.</p>
        `,
        author: "Health Editor",
        category: "health",
        tags: ["health", "medical", "diabetes", "research", "breakthrough"],
        status: "published",
        featured: false,
        breakingNews: true,
        imageUrl: "https://via.placeholder.com/800x450/98D8C8/FFFFFF?text=Medical+Breakthrough",
        imageCaption: "Medical research laboratory",
        publishDate: new Date(Date.now() - 21600000),
        views: 1450
    }
];

const sampleUsers = [
    {
        name: "Admin User",
        email: "admin@bahadurgarhnews.com",
        password: "admin123",
        role: "admin",
        isActive: true,
        emailVerified: true
    },
    {
        name: "Editor User",
        email: "editor@bahadurgarhnews.com",
        password: "editor123",
        role: "editor",
        isActive: true,
        emailVerified: true
    },
    {
        name: "John Doe",
        email: "john@example.com",
        password: "user123",
        role: "user",
        isActive: true,
        emailVerified: true
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "user123",
        role: "user",
        isActive: true,
        emailVerified: true
    }
];

const sampleComments = [
    {
        content: "This is excellent news! The government's focus on economic reforms is exactly what we need right now.",
        articleId: null, // Will be set after creating articles
        userId: null,  // Will be set after creating users
        status: "approved"
    },
    {
        content: "Great analysis of the cricket match. The team really showed exceptional performance under pressure.",
        articleId: null,
        userId: null,
        status: "approved"
    },
    {
        content: "The AI investment news is very encouraging for India's tech sector. Looking forward to seeing the impact.",
        articleId: null,
        userId: null,
        status: "approved"
    }
];

// Seed function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bahadurgarh-news');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Article.deleteMany({});
        await Category.deleteMany({});
        await Comment.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create categories
        const categories = await Category.create(sampleCategories);
        console.log(`✅ Created ${categories.length} categories`);

        // Create users
        const users = await User.create(sampleUsers);
        console.log(`✅ Created ${users.length} users`);

        // Create articles
        const articles = await Article.create(sampleArticles);
        console.log(`✅ Created ${articles.length} articles`);

        // Create comments
        const comments = [];
        for (let i = 0; i < sampleComments.length; i++) {
            const comment = {
                ...sampleComments[i],
                article: articles[i % articles.length]._id,
                user: users[(i + 1) % users.length]._id
            };
            comments.push(comment);
        }
        await Comment.create(comments);
        console.log(`✅ Created ${comments.length} comments`);

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Sample Data Created:');
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Articles: ${articles.length}`);
        console.log(`   - Comments: ${comments.length}`);
        
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin@bahadurgarhnews.com / admin123');
        console.log('   Editor: editor@bahadurgarhnews.com / editor123');
        console.log('   User: john@example.com / user123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sampleCategories, sampleArticles, sampleUsers, sampleComments };
