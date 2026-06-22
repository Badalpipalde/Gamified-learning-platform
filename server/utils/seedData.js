const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Achievement = require('../models/Achievement');
const ForumPost = require('../models/ForumPost');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Achievement.deleteMany({}),
      ForumPost.deleteMany({}),
      Progress.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const teacher = await User.create({
      name: 'Priya Sharma',
      email: 'teacher@gramsiksha.com',
      password: 'password123',
      role: 'teacher',
      isVerified: true,
      avatar: '',
      xp: 2500,
      level: 6,
      coins: 500
    });

    const students = await User.create([
      {
        name: 'Rahul Kumar',
        email: 'student@gramsiksha.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        xp: 1250,
        level: 3,
        coins: 340,
        streak: { current: 7, longest: 14, lastActive: new Date() }
      },
      {
        name: 'Anita Devi',
        email: 'anita@gramsiksha.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        xp: 980,
        level: 2,
        coins: 220,
        streak: { current: 3, longest: 10, lastActive: new Date() }
      },
      {
        name: 'Suresh Yadav',
        email: 'suresh@gramsiksha.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        xp: 1800,
        level: 4,
        coins: 450,
        streak: { current: 12, longest: 12, lastActive: new Date() }
      },
      {
        name: 'Meena Kumari',
        email: 'meena@gramsiksha.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        xp: 750,
        level: 2,
        coins: 180,
        streak: { current: 5, longest: 8, lastActive: new Date() }
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@gramsiksha.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        xp: 2100,
        level: 5,
        coins: 520,
        streak: { current: 15, longest: 15, lastActive: new Date() }
      }
    ]);

    const parent = await User.create({
      name: 'Sunita Devi',
      email: 'parent@gramsiksha.com',
      password: 'password123',
      role: 'parent',
      isVerified: true,
      children: [students[0]._id, students[1]._id]
    });

    console.log('👥 Created users');

    // Create achievements
    const achievements = await Achievement.create([
      {
        name: 'First Steps',
        nameHi: 'पहला कदम',
        description: 'Complete your first lesson',
        descriptionHi: 'अपना पहला पाठ पूरा करें',
        icon: '🌱',
        category: 'learning',
        requirement: { type: 'lessons_completed', value: 1 },
        xpReward: 100,
        coinReward: 25,
        rarity: 'common'
      },
      {
        name: 'Knowledge Seeker',
        nameHi: 'ज्ञान साधक',
        description: 'Complete 5 lessons',
        descriptionHi: '5 पाठ पूरे करें',
        icon: '📚',
        category: 'learning',
        requirement: { type: 'lessons_completed', value: 5 },
        xpReward: 300,
        coinReward: 75,
        rarity: 'rare'
      },
      {
        name: 'Streak Master',
        nameHi: 'लगातार मास्टर',
        description: 'Maintain a 7-day streak',
        descriptionHi: '7 दिन की लगातार लकीर बनाए रखें',
        icon: '🔥',
        category: 'streak',
        requirement: { type: 'streak_days', value: 7 },
        xpReward: 500,
        coinReward: 100,
        rarity: 'epic'
      },
      {
        name: 'XP Champion',
        nameHi: 'XP चैंपियन',
        description: 'Earn 1000 XP points',
        descriptionHi: '1000 XP अंक अर्जित करें',
        icon: '⭐',
        category: 'learning',
        requirement: { type: 'xp_earned', value: 1000 },
        xpReward: 500,
        coinReward: 150,
        rarity: 'epic'
      },
      {
        name: 'Legend',
        nameHi: 'महान',
        description: 'Earn 5000 XP points',
        descriptionHi: '5000 XP अंक अर्जित करें',
        icon: '👑',
        category: 'learning',
        requirement: { type: 'xp_earned', value: 5000 },
        xpReward: 1000,
        coinReward: 300,
        rarity: 'legendary'
      },
      {
        name: 'Coin Collector',
        nameHi: 'सिक्का संग्रहकर्ता',
        description: 'Collect 200 coins',
        descriptionHi: '200 सिक्के एकत्र करें',
        icon: '💰',
        category: 'special',
        requirement: { type: 'coins_earned', value: 200 },
        xpReward: 200,
        coinReward: 50,
        rarity: 'rare'
      }
    ]);

    // Assign some badges to students
    students[0].badges = [achievements[0]._id, achievements[3]._id];
    students[2].badges = [achievements[0]._id, achievements[1]._id, achievements[2]._id, achievements[3]._id];
    students[4].badges = [achievements[0]._id, achievements[1]._id, achievements[2]._id, achievements[3]._id];
    await Promise.all(students.map(s => s.save()));

    console.log('🏆 Created achievements');

    // Create lessons
    const lessons = await Lesson.create([
      {
        title: 'Introduction to Numbers',
        titleHi: 'संख्याओं का परिचय',
        description: 'Learn the basics of numbers and counting. This lesson covers natural numbers, whole numbers, and basic arithmetic operations.',
        descriptionHi: 'संख्याओं और गिनती की मूल बातें सीखें।',
        subject: 'mathematics',
        grade: 3,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Numbers are the building blocks of mathematics. Natural numbers start from 1, 2, 3... Whole numbers include 0 along with natural numbers. We use numbers every day for counting, measuring, and many other activities.',
        contentHi: 'संख्याएँ गणित की नींव हैं। प्राकृतिक संख्याएँ 1, 2, 3... से शुरू होती हैं।',
        duration: 15,
        xpReward: 50,
        coinReward: 10,
        teacher: teacher._id,
        isPublished: true,
        order: 1,
        tags: ['numbers', 'counting', 'basics']
      },
      {
        title: 'Plants Around Us',
        titleHi: 'हमारे आसपास के पौधे',
        description: 'Explore different types of plants in our environment. Learn about herbs, shrubs, trees, and their importance in our ecosystem.',
        descriptionHi: 'हमारे वातावरण में विभिन्न प्रकार के पौधों का अन्वेषण करें।',
        subject: 'science',
        grade: 3,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Plants are living organisms that produce their own food through photosynthesis. They come in many forms: herbs (small, soft stem), shrubs (medium, woody stem), and trees (tall, strong trunk).',
        contentHi: 'पौधे जीवित जीव हैं जो प्रकाश संश्लेषण के माध्यम से अपना भोजन बनाते हैं।',
        duration: 20,
        xpReward: 60,
        coinReward: 15,
        teacher: teacher._id,
        isPublished: true,
        order: 2,
        tags: ['plants', 'nature', 'biology']
      },
      {
        title: 'My Family and Friends',
        titleHi: 'मेरा परिवार और दोस्त',
        description: 'Learn about family relationships, community bonds, and the importance of social connections in our lives.',
        descriptionHi: 'पारिवारिक रिश्तों और सामाजिक संबंधों के बारे में जानें।',
        subject: 'social_studies',
        grade: 2,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Family is the first social group we belong to. It includes parents, siblings, grandparents, and other relatives. Friends are people we choose to spend time with and share experiences.',
        contentHi: 'परिवार पहला सामाजिक समूह है जिसमें हम शामिल होते हैं।',
        duration: 15,
        xpReward: 40,
        coinReward: 10,
        teacher: teacher._id,
        isPublished: true,
        order: 3,
        tags: ['family', 'community', 'social']
      },
      {
        title: 'Basic Addition & Subtraction',
        titleHi: 'बुनियादी जोड़ और घटाव',
        description: 'Master the fundamental operations of addition and subtraction with practical examples from daily life.',
        descriptionHi: 'दैनिक जीवन के व्यावहारिक उदाहरणों के साथ जोड़ और घटाव की मौलिक क्रियाओं में महारत हासिल करें।',
        subject: 'mathematics',
        grade: 3,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Addition means combining two or more numbers to get a total. Subtraction means taking away one number from another. Both are essential life skills used in shopping, cooking, and everyday activities.',
        contentHi: 'जोड़ का मतलब है दो या अधिक संख्याओं को मिलाकर कुल प्राप्त करना।',
        duration: 25,
        xpReward: 75,
        coinReward: 20,
        teacher: teacher._id,
        isPublished: true,
        order: 4,
        tags: ['addition', 'subtraction', 'arithmetic']
      },
      {
        title: 'Water - Our Lifeline',
        titleHi: 'पानी - हमारी जीवन रेखा',
        description: 'Understand the importance of water, water cycle, and water conservation practices for rural communities.',
        descriptionHi: 'पानी के महत्व, जल चक्र और ग्रामीण समुदायों के लिए जल संरक्षण प्रथाओं को समझें।',
        subject: 'environmental_studies',
        grade: 4,
        difficulty: 'intermediate',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Water covers about 71% of the Earth surface. The water cycle includes evaporation, condensation, precipitation, and collection. Clean water is essential for drinking, farming, and sanitation.',
        contentHi: 'पानी पृथ्वी की सतह का लगभग 71% हिस्सा कवर करता है।',
        duration: 30,
        xpReward: 80,
        coinReward: 20,
        teacher: teacher._id,
        isPublished: true,
        order: 5,
        tags: ['water', 'environment', 'conservation']
      },
      {
        title: 'English Alphabets & Words',
        titleHi: 'अंग्रेजी वर्णमाला और शब्द',
        description: 'Learn English alphabets, basic words, and simple sentence formation for beginners.',
        descriptionHi: 'शुरुआती लोगों के लिए अंग्रेजी वर्णमाला, बुनियादी शब्द और सरल वाक्य निर्माण सीखें।',
        subject: 'english',
        grade: 2,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'The English alphabet has 26 letters. Each letter has an uppercase (capital) and lowercase (small) form. Learning words starts with simple three-letter words like cat, bat, mat.',
        contentHi: 'अंग्रेजी वर्णमाला में 26 अक्षर हैं।',
        duration: 20,
        xpReward: 50,
        coinReward: 10,
        teacher: teacher._id,
        isPublished: true,
        order: 6,
        tags: ['alphabets', 'words', 'basics']
      },
      {
        title: 'Hindi Varnamala',
        titleHi: 'हिंदी वर्णमाला',
        description: 'Learn Hindi alphabets (Swar and Vyanjan), basic words, and pronunciation.',
        descriptionHi: 'हिंदी वर्णमाला (स्वर और व्यंजन), बुनियादी शब्द और उच्चारण सीखें।',
        subject: 'hindi',
        grade: 2,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'Hindi script is called Devanagari. It has vowels (Swar) - अ, आ, इ, ई, उ, ऊ... and consonants (Vyanjan) - क, ख, ग, घ...',
        contentHi: 'हिंदी लिपि को देवनागरी कहते हैं। इसमें स्वर - अ, आ, इ, ई... और व्यंजन - क, ख, ग, घ... होते हैं।',
        duration: 20,
        xpReward: 50,
        coinReward: 10,
        teacher: teacher._id,
        isPublished: true,
        order: 7,
        tags: ['hindi', 'alphabets', 'language']
      },
      {
        title: 'Introduction to Computers',
        titleHi: 'कंप्यूटर का परिचय',
        description: 'Learn about basic parts of a computer, input/output devices, and how computers help us in daily life.',
        descriptionHi: 'कंप्यूटर के मूल भागों, इनपुट/आउटपुट उपकरणों और कंप्यूटर हमारी दैनिक जीवन में कैसे मदद करते हैं, इसके बारे में जानें।',
        subject: 'computer_science',
        grade: 4,
        difficulty: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: 'A computer is an electronic device that processes data. Main parts include Monitor (display), Keyboard (input), Mouse (input), CPU (processing unit). Computers help in education, communication, and many other fields.',
        contentHi: 'कंप्यूटर एक इलेक्ट्रॉनिक उपकरण है जो डेटा को प्रोसेस करता है।',
        duration: 25,
        xpReward: 70,
        coinReward: 15,
        teacher: teacher._id,
        isPublished: true,
        order: 8,
        tags: ['computer', 'technology', 'basics']
      }
    ]);

    // Add lessons to teacher's created lessons
    teacher.createdLessons = lessons.map(l => l._id);
    await teacher.save();

    console.log('📖 Created lessons');

    // Create quizzes
    const quizzes = await Quiz.create([
      {
        title: 'Numbers Quiz',
        titleHi: 'संख्या प्रश्नोत्तरी',
        description: 'Test your knowledge of numbers and counting',
        lesson: lessons[0]._id,
        teacher: teacher._id,
        timeLimit: 5,
        passingScore: 60,
        xpReward: 100,
        coinReward: 25,
        difficulty: 'beginner',
        isPublished: true,
        questions: [
          {
            question: 'What comes after 5?',
            questionHi: '5 के बाद क्या आता है?',
            type: 'mcq',
            options: [
              { text: '4', textHi: '4', isCorrect: false },
              { text: '6', textHi: '6', isCorrect: true },
              { text: '7', textHi: '7', isCorrect: false },
              { text: '3', textHi: '3', isCorrect: false }
            ],
            explanation: '5 + 1 = 6, so 6 comes after 5',
            points: 10
          },
          {
            question: 'Which is the smallest number?',
            questionHi: 'सबसे छोटी संख्या कौन सी है?',
            type: 'mcq',
            options: [
              { text: '5', textHi: '5', isCorrect: false },
              { text: '1', textHi: '1', isCorrect: true },
              { text: '3', textHi: '3', isCorrect: false },
              { text: '9', textHi: '9', isCorrect: false }
            ],
            explanation: '1 is the smallest natural number',
            points: 10
          },
          {
            question: '2 + 3 = ?',
            questionHi: '2 + 3 = ?',
            type: 'fill_blank',
            options: [],
            correctAnswer: '5',
            explanation: '2 plus 3 equals 5',
            points: 15
          },
          {
            question: '10 is greater than 20',
            questionHi: '10, 20 से बड़ा है',
            type: 'true_false',
            options: [
              { text: 'True', textHi: 'सही', isCorrect: false },
              { text: 'False', textHi: 'गलत', isCorrect: true }
            ],
            explanation: '10 is less than 20',
            points: 10
          }
        ]
      },
      {
        title: 'Plants Quiz',
        titleHi: 'पौधे प्रश्नोत्तरी',
        description: 'Test your knowledge about plants',
        lesson: lessons[1]._id,
        teacher: teacher._id,
        timeLimit: 5,
        passingScore: 60,
        xpReward: 100,
        coinReward: 25,
        difficulty: 'beginner',
        isPublished: true,
        questions: [
          {
            question: 'Which part of the plant makes food?',
            questionHi: 'पौधे का कौन सा भाग भोजन बनाता है?',
            type: 'mcq',
            options: [
              { text: 'Root', textHi: 'जड़', isCorrect: false },
              { text: 'Stem', textHi: 'तना', isCorrect: false },
              { text: 'Leaf', textHi: 'पत्ती', isCorrect: true },
              { text: 'Flower', textHi: 'फूल', isCorrect: false }
            ],
            explanation: 'Leaves make food through photosynthesis',
            points: 10
          },
          {
            question: 'Trees have soft stems',
            questionHi: 'पेड़ों के तने नरम होते हैं',
            type: 'true_false',
            options: [
              { text: 'True', textHi: 'सही', isCorrect: false },
              { text: 'False', textHi: 'गलत', isCorrect: true }
            ],
            explanation: 'Trees have hard, woody stems called trunks',
            points: 10
          },
          {
            question: 'What do plants need to grow? (Name one thing)',
            questionHi: 'पौधों को बढ़ने के लिए क्या चाहिए?',
            type: 'fill_blank',
            options: [],
            correctAnswer: 'water',
            explanation: 'Plants need water, sunlight, air, and soil',
            points: 15
          }
        ]
      }
    ]);

    // Link quizzes to lessons
    lessons[0].quizzes = [quizzes[0]._id];
    lessons[1].quizzes = [quizzes[1]._id];
    await Promise.all([lessons[0].save(), lessons[1].save()]);

    console.log('❓ Created quizzes');

    // Create progress records
    await Progress.create([
      {
        student: students[0]._id,
        lesson: lessons[0]._id,
        status: 'completed',
        progressPercent: 100,
        videoWatched: true,
        quizCompleted: true,
        quizScore: 85,
        exerciseCompleted: true,
        xpEarned: 50,
        coinsEarned: 10,
        timeSpent: 1200,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        student: students[0]._id,
        lesson: lessons[1]._id,
        status: 'completed',
        progressPercent: 100,
        videoWatched: true,
        quizCompleted: true,
        quizScore: 90,
        exerciseCompleted: true,
        xpEarned: 60,
        coinsEarned: 15,
        timeSpent: 1500,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        student: students[0]._id,
        lesson: lessons[3]._id,
        status: 'in_progress',
        progressPercent: 40,
        videoWatched: true,
        quizCompleted: false,
        exerciseCompleted: false,
        timeSpent: 600
      },
      {
        student: students[2]._id,
        lesson: lessons[0]._id,
        status: 'completed',
        progressPercent: 100,
        videoWatched: true,
        quizCompleted: true,
        quizScore: 95,
        exerciseCompleted: true,
        xpEarned: 50,
        coinsEarned: 10,
        timeSpent: 900,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Update completed lessons for students
    students[0].completedLessons = [lessons[0]._id, lessons[1]._id];
    students[2].completedLessons = [lessons[0]._id];
    await Promise.all([students[0].save(), students[2].save()]);

    console.log('📊 Created progress records');

    // Create forum posts
    await ForumPost.create([
      {
        title: 'Tips for learning Mathematics easily',
        content: 'I found that practicing with real objects like stones and sticks helps understand numbers better. What methods do you use?',
        author: students[0]._id,
        category: 'discussion',
        tags: ['mathematics', 'tips', 'learning'],
        likes: [students[1]._id, students[2]._id],
        replies: [
          {
            author: students[2]._id,
            content: 'I use my fingers for counting! Also, drawing pictures helps a lot.',
            likes: [students[0]._id]
          },
          {
            author: teacher._id,
            content: 'Great discussion! Using physical objects is called "manipulatives" in education. Keep exploring these methods!',
            likes: [students[0]._id, students[1]._id, students[2]._id]
          }
        ],
        views: 45
      },
      {
        title: '🏆 I completed my first 7-day streak!',
        content: 'So happy to share that I just completed a 7-day learning streak! The daily challenges really kept me motivated. Keep going everyone!',
        author: students[0]._id,
        category: 'achievement',
        tags: ['streak', 'achievement', 'motivation'],
        likes: [students[1]._id, students[2]._id, students[3]._id, students[4]._id, teacher._id],
        views: 78
      },
      {
        title: 'How does photosynthesis work?',
        content: 'I watched the Plants lesson but I am confused about how exactly plants make food from sunlight. Can someone explain in simple words?',
        author: students[1]._id,
        category: 'doubt',
        tags: ['science', 'plants', 'doubt'],
        replies: [
          {
            author: teacher._id,
            content: 'Great question! Think of it like cooking. Plants use sunlight as energy (like fire), water and CO2 as ingredients, and chlorophyll (green color) as the pan. They mix these to make glucose (food) and release oxygen.',
            likes: [students[0]._id, students[1]._id]
          }
        ],
        views: 32
      }
    ]);

    console.log('💬 Created forum posts');

    // Create notifications
    await Notification.create([
      {
        user: students[0]._id,
        type: 'achievement',
        title: 'Badge Unlocked! 🏆',
        message: 'You earned the "First Steps" badge for completing your first lesson!',
        icon: '🌱'
      },
      {
        user: students[0]._id,
        type: 'streak',
        title: 'Streak Alert! 🔥',
        message: 'Amazing! You have a 7-day learning streak. Keep it up!',
        icon: '🔥'
      },
      {
        user: students[0]._id,
        type: 'lesson',
        title: 'New Lesson Available 📖',
        message: 'A new lesson "Water - Our Lifeline" has been published. Start learning now!',
        icon: '📖',
        link: '/learn'
      }
    ]);

    console.log('🔔 Created notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('  Student: student@gramsiksha.com / password123');
    console.log('  Teacher: teacher@gramsiksha.com / password123');
    console.log('  Parent:  parent@gramsiksha.com  / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
