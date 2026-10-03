require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Badge = require('../models/Badge');
const ParentLink = require('../models/ParentLink');
const CodeProblem = require('../models/CodeProblem');
const GameQuestion = require('../models/GameQuestion');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Badge.deleteMany({}),
      ParentLink.deleteMany({}),
      CodeProblem.deleteMany({}),
      GameQuestion.deleteMany({}),
    ]);
    console.log('Cleared all collections.');

    // ===================== USERS =====================
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@vidyaquest.com',
      password: 'admin123',
      role: 'admin',
    });

    const teacher1 = await User.create({
      name: 'Sunita Sharma',
      email: 'sunita@vidyaquest.com',
      password: 'teacher123',
      role: 'teacher',
    });

    const teacher2 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@vidyaquest.com',
      password: 'teacher123',
      role: 'teacher',
    });

    // ===================== CLASSES =====================
    const class5A = await Class.create({
      name: 'Class 5', section: 'A', teacherId: teacher1._id, school: 'Vidya Public School',
    });
    const class6B = await Class.create({
      name: 'Class 6', section: 'B', teacherId: teacher2._id, school: 'Vidya Public School',
    });

    teacher1.classId = class5A._id; await teacher1.save();
    teacher2.classId = class6B._id; await teacher2.save();

    // Students
    const students = await User.create([
      { name: 'Aarav Patel', email: 'aarav@vidyaquest.com', password: 'student123', role: 'student', classId: class5A._id, rollNo: '5A-01' },
      { name: 'Diya Singh', email: 'diya@vidyaquest.com', password: 'student123', role: 'student', classId: class5A._id, rollNo: '5A-02' },
      { name: 'Arjun Mehta', email: 'arjun@vidyaquest.com', password: 'student123', role: 'student', classId: class5A._id, rollNo: '5A-03' },
      { name: 'Ananya Gupta', email: 'ananya@vidyaquest.com', password: 'student123', role: 'student', classId: class6B._id, rollNo: '6B-01' },
      { name: 'Rohan Verma', email: 'rohan@vidyaquest.com', password: 'student123', role: 'student', classId: class6B._id, rollNo: '6B-02' },
      { name: 'Priya Yadav', email: 'priya@vidyaquest.com', password: 'student123', role: 'student', classId: class6B._id, rollNo: '6B-03' },
    ]);

    // Parents
    await User.create([
      { name: 'Vikram Patel', email: 'vikram@vidyaquest.com', password: 'parent123', role: 'parent' },
      { name: 'Meera Singh', email: 'meera@vidyaquest.com', password: 'parent123', role: 'parent' },
    ]);

    console.log('Users and classes created.');

    // ===================== SUBJECTS =====================
    const subjects = await Subject.create([
      { name: { en: 'Science', hi: 'विज्ञान' }, slug: 'science', icon: '🔬', order: 1 },
      { name: { en: 'Mathematics', hi: 'गणित' }, slug: 'math', icon: '🔢', order: 2 },
      { name: { en: 'General Knowledge', hi: 'सामान्य ज्ञान' }, slug: 'gk', icon: '🌍', order: 3 },
      { name: { en: 'Aptitude', hi: 'अभिक्षमता' }, slug: 'aptitude', icon: '🧠', order: 4 },
      { name: { en: 'English', hi: 'अंग्रेजी' }, slug: 'english', icon: '📖', order: 5 },
      { name: { en: 'Hindi', hi: 'हिंदी' }, slug: 'hindi', icon: '📝', order: 6 },
    ]);

    console.log('Subjects created:', subjects.length);

    // ===================== QUIZZES + QUESTIONS =====================

    // Helper to create quiz with questions
    async function createQuizWithQuestions(subjectSlug, title, level, questions) {
      const subject = subjects.find(s => s.slug === subjectSlug);
      const quiz = await Quiz.create({
        subjectId: subject._id,
        title,
        level,
        questionCount: questions.length,
      });
      const qDocs = questions.map(q => ({
        quizId: quiz._id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || { en: '', hi: '' },
      }));
      await Question.insertMany(qDocs);
      return quiz;
    }

    // ---- SCIENCE ----
    await createQuizWithQuestions('science', { en: 'Plants & Animals', hi: 'पौधे और जानवर' }, 1, [
      { text: { en: 'What do plants need to make food?', hi: 'पौधों को भोजन बनाने के लिए क्या चाहिए?' }, options: [{ en: 'Sunlight', hi: 'सूर्य का प्रकाश' }, { en: 'Darkness', hi: 'अंधेरा' }, { en: 'Music', hi: 'संगीत' }, { en: 'Wind', hi: 'हवा' }], correctIndex: 0, explanation: { en: 'Plants use sunlight for photosynthesis.', hi: 'पौधे प्रकाश संश्लेषण के लिए सूर्य के प्रकाश का उपयोग करते हैं।' } },
      { text: { en: 'Which gas do plants release during photosynthesis?', hi: 'प्रकाश संश्लेषण के दौरान पौधे कौन सी गैस छोड़ते हैं?' }, options: [{ en: 'Carbon dioxide', hi: 'कार्बन डाइऑक्साइड' }, { en: 'Oxygen', hi: 'ऑक्सीजन' }, { en: 'Nitrogen', hi: 'नाइट्रोजन' }, { en: 'Hydrogen', hi: 'हाइड्रोजन' }], correctIndex: 1 },
      { text: { en: 'What is the main function of roots?', hi: 'जड़ों का मुख्य कार्य क्या है?' }, options: [{ en: 'Make food', hi: 'भोजन बनाना' }, { en: 'Absorb water', hi: 'पानी अवशोषित करना' }, { en: 'Produce flowers', hi: 'फूल पैदा करना' }, { en: 'Release oxygen', hi: 'ऑक्सीजन छोड़ना' }], correctIndex: 1 },
      { text: { en: 'Which part of the plant makes seeds?', hi: 'पौधे का कौन सा भाग बीज बनाता है?' }, options: [{ en: 'Leaf', hi: 'पत्ती' }, { en: 'Root', hi: 'जड़' }, { en: 'Flower', hi: 'फूल' }, { en: 'Stem', hi: 'तना' }], correctIndex: 2 },
      { text: { en: 'Animals that eat only plants are called?', hi: 'केवल पौधे खाने वाले जानवर क्या कहलाते हैं?' }, options: [{ en: 'Carnivores', hi: 'मांसाहारी' }, { en: 'Omnivores', hi: 'सर्वाहारी' }, { en: 'Herbivores', hi: 'शाकाहारी' }, { en: 'Insectivores', hi: 'कीटाहारी' }], correctIndex: 2 },
    ]);

    await createQuizWithQuestions('science', { en: 'Human Body Basics', hi: 'मानव शरीर की मूल बातें' }, 2, [
      { text: { en: 'How many bones does an adult human body have?', hi: 'एक वयस्क मानव शरीर में कितनी हड्डियाँ होती हैं?' }, options: [{ en: '206', hi: '206' }, { en: '300', hi: '300' }, { en: '150', hi: '150' }, { en: '100', hi: '100' }], correctIndex: 0 },
      { text: { en: 'Which organ pumps blood?', hi: 'कौन सा अंग रक्त पंप करता है?' }, options: [{ en: 'Brain', hi: 'मस्तिष्क' }, { en: 'Heart', hi: 'हृदय' }, { en: 'Liver', hi: 'यकृत' }, { en: 'Kidney', hi: 'गुर्दा' }], correctIndex: 1 },
      { text: { en: 'What is the largest organ of the human body?', hi: 'मानव शरीर का सबसे बड़ा अंग कौन सा है?' }, options: [{ en: 'Heart', hi: 'हृदय' }, { en: 'Brain', hi: 'मस्तिष्क' }, { en: 'Skin', hi: 'त्वचा' }, { en: 'Liver', hi: 'यकृत' }], correctIndex: 2 },
      { text: { en: 'Which part of the body controls thinking?', hi: 'शरीर का कौन सा भाग सोच को नियंत्रित करता है?' }, options: [{ en: 'Heart', hi: 'हृदय' }, { en: 'Brain', hi: 'मस्तिष्क' }, { en: 'Stomach', hi: 'पेट' }, { en: 'Lungs', hi: 'फेफड़े' }], correctIndex: 1 },
      { text: { en: 'How many lungs do we have?', hi: 'हमारे कितने फेफड़े होते हैं?' }, options: [{ en: '1', hi: '1' }, { en: '2', hi: '2' }, { en: '3', hi: '3' }, { en: '4', hi: '4' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('science', { en: 'Water & Air', hi: 'पानी और हवा' }, 1, [
      { text: { en: 'What percentage of Earth is covered by water?', hi: 'पृथ्वी का कितना प्रतिशत भाग पानी से ढका है?' }, options: [{ en: '50%', hi: '50%' }, { en: '71%', hi: '71%' }, { en: '30%', hi: '30%' }, { en: '90%', hi: '90%' }], correctIndex: 1 },
      { text: { en: 'What are the three states of water?', hi: 'पानी की तीन अवस्थाएँ क्या हैं?' }, options: [{ en: 'Hot, cold, warm', hi: 'गर्म, ठंडा, गुनगुना' }, { en: 'Solid, liquid, gas', hi: 'ठोस, तरल, गैस' }, { en: 'Big, small, medium', hi: 'बड़ा, छोटा, मध्यम' }, { en: 'Fast, slow, still', hi: 'तेज, धीमा, स्थिर' }], correctIndex: 1 },
      { text: { en: 'Which gas is most abundant in air?', hi: 'हवा में सबसे अधिक कौन सी गैस है?' }, options: [{ en: 'Oxygen', hi: 'ऑक्सीजन' }, { en: 'Carbon dioxide', hi: 'कार्बन डाइऑक्साइड' }, { en: 'Nitrogen', hi: 'नाइट्रोजन' }, { en: 'Hydrogen', hi: 'हाइड्रोजन' }], correctIndex: 2 },
      { text: { en: 'Rain is which form of water?', hi: 'बारिश पानी का कौन सा रूप है?' }, options: [{ en: 'Solid', hi: 'ठोस' }, { en: 'Gas', hi: 'गैस' }, { en: 'Liquid', hi: 'तरल' }, { en: 'Plasma', hi: 'प्लाज्मा' }], correctIndex: 2 },
      { text: { en: 'What is water pollution?', hi: 'जल प्रदूषण क्या है?' }, options: [{ en: 'Clean water', hi: 'साफ पानी' }, { en: 'Dirty water from waste', hi: 'कचरे से गंदा पानी' }, { en: 'Hot water', hi: 'गर्म पानी' }, { en: 'Cold water', hi: 'ठंडा पानी' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('science', { en: 'Light & Sound', hi: 'प्रकाश और ध्वनि' }, 3, [
      { text: { en: 'Light travels in what kind of lines?', hi: 'प्रकाश किस प्रकार की रेखाओं में चलता है?' }, options: [{ en: 'Curved', hi: 'घुमावदार' }, { en: 'Straight', hi: 'सीधी' }, { en: 'Zigzag', hi: 'टेढ़ी-मेढ़ी' }, { en: 'Circular', hi: 'गोलाकार' }], correctIndex: 1 },
      { text: { en: 'What is the speed of light approximately?', hi: 'प्रकाश की गति लगभग कितनी है?' }, options: [{ en: '300,000 km/s', hi: '3,00,000 किमी/सेकंड' }, { en: '150,000 km/s', hi: '1,50,000 किमी/सेकंड' }, { en: '1,000 km/s', hi: '1,000 किमी/सेकंड' }, { en: '30,000 km/s', hi: '30,000 किमी/सेकंड' }], correctIndex: 0 },
      { text: { en: 'Which color has the longest wavelength?', hi: 'किस रंग की तरंगदैर्ध्य सबसे अधिक होती है?' }, options: [{ en: 'Blue', hi: 'नीला' }, { en: 'Green', hi: 'हरा' }, { en: 'Red', hi: 'लाल' }, { en: 'Violet', hi: 'बैंगनी' }], correctIndex: 2 },
      { text: { en: 'Sound cannot travel through?', hi: 'ध्वनि किसमें से नहीं गुजर सकती?' }, options: [{ en: 'Water', hi: 'पानी' }, { en: 'Air', hi: 'हवा' }, { en: 'Vacuum', hi: 'निर्वात' }, { en: 'Metal', hi: 'धातु' }], correctIndex: 2 },
      { text: { en: 'Echo is caused by?', hi: 'प्रतिध्वनि किसके कारण होती है?' }, options: [{ en: 'Absorption of sound', hi: 'ध्वनि का अवशोषण' }, { en: 'Reflection of sound', hi: 'ध्वनि का परावर्तन' }, { en: 'Refraction of sound', hi: 'ध्वनि का अपवर्तन' }, { en: 'Diffraction of sound', hi: 'ध्वनि का विवर्तन' }], correctIndex: 1 },
    ]);

    // ---- MATH ----
    await createQuizWithQuestions('math', { en: 'Basic Arithmetic', hi: 'बुनियादी अंकगणित' }, 1, [
      { text: { en: 'What is 25 + 37?', hi: '25 + 37 कितना होता है?' }, options: [{ en: '52', hi: '52' }, { en: '62', hi: '62' }, { en: '72', hi: '72' }, { en: '57', hi: '57' }], correctIndex: 1 },
      { text: { en: 'What is 100 - 45?', hi: '100 - 45 कितना होता है?' }, options: [{ en: '65', hi: '65' }, { en: '55', hi: '55' }, { en: '45', hi: '45' }, { en: '50', hi: '50' }], correctIndex: 1 },
      { text: { en: 'What is 8 × 7?', hi: '8 × 7 कितना होता है?' }, options: [{ en: '54', hi: '54' }, { en: '48', hi: '48' }, { en: '56', hi: '56' }, { en: '64', hi: '64' }], correctIndex: 2 },
      { text: { en: 'What is 72 ÷ 9?', hi: '72 ÷ 9 कितना होता है?' }, options: [{ en: '7', hi: '7' }, { en: '8', hi: '8' }, { en: '9', hi: '9' }, { en: '6', hi: '6' }], correctIndex: 1 },
      { text: { en: 'What is the value of 5²?', hi: '5² का मान क्या है?' }, options: [{ en: '10', hi: '10' }, { en: '15', hi: '15' }, { en: '20', hi: '20' }, { en: '25', hi: '25' }], correctIndex: 3 },
    ]);

    await createQuizWithQuestions('math', { en: 'Fractions', hi: 'भिन्न' }, 2, [
      { text: { en: 'What is 1/2 + 1/4?', hi: '1/2 + 1/4 कितना होता है?' }, options: [{ en: '2/6', hi: '2/6' }, { en: '3/4', hi: '3/4' }, { en: '1/6', hi: '1/6' }, { en: '2/4', hi: '2/4' }], correctIndex: 1 },
      { text: { en: 'Which fraction is largest?', hi: 'कौन सी भिन्न सबसे बड़ी है?' }, options: [{ en: '1/3', hi: '1/3' }, { en: '1/4', hi: '1/4' }, { en: '1/2', hi: '1/2' }, { en: '1/5', hi: '1/5' }], correctIndex: 2 },
      { text: { en: 'What is 3/5 as a decimal?', hi: '3/5 दशमलव में कितना होता है?' }, options: [{ en: '0.3', hi: '0.3' }, { en: '0.5', hi: '0.5' }, { en: '0.6', hi: '0.6' }, { en: '0.35', hi: '0.35' }], correctIndex: 2 },
      { text: { en: 'Simplify 4/8', hi: '4/8 को सरल करें' }, options: [{ en: '1/4', hi: '1/4' }, { en: '1/2', hi: '1/2' }, { en: '2/4', hi: '2/4' }, { en: '1/3', hi: '1/3' }], correctIndex: 1 },
      { text: { en: 'What is 2/3 × 3/4?', hi: '2/3 × 3/4 कितना होता है?' }, options: [{ en: '6/12', hi: '6/12' }, { en: '1/2', hi: '1/2' }, { en: '5/7', hi: '5/7' }, { en: '2/4', hi: '2/4' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('math', { en: 'Geometry Basics', hi: 'ज्यामिति की मूल बातें' }, 2, [
      { text: { en: 'How many sides does a triangle have?', hi: 'एक त्रिभुज की कितनी भुजाएँ होती हैं?' }, options: [{ en: '3', hi: '3' }, { en: '4', hi: '4' }, { en: '5', hi: '5' }, { en: '6', hi: '6' }], correctIndex: 0 },
      { text: { en: 'What is the sum of angles in a triangle?', hi: 'एक त्रिभुज के कोणों का योग कितना होता है?' }, options: [{ en: '90°', hi: '90°' }, { en: '180°', hi: '180°' }, { en: '270°', hi: '270°' }, { en: '360°', hi: '360°' }], correctIndex: 1 },
      { text: { en: 'A square has how many equal sides?', hi: 'एक वर्ग की कितनी बराबर भुजाएँ होती हैं?' }, options: [{ en: '2', hi: '2' }, { en: '3', hi: '3' }, { en: '4', hi: '4' }, { en: '5', hi: '5' }], correctIndex: 2 },
      { text: { en: 'What is the area of a rectangle with length 5 and width 3?', hi: 'लंबाई 5 और चौड़ाई 3 के आयत का क्षेत्रफल क्या है?' }, options: [{ en: '8', hi: '8' }, { en: '15', hi: '15' }, { en: '16', hi: '16' }, { en: '10', hi: '10' }], correctIndex: 1 },
      { text: { en: 'What is the perimeter of a square with side 6?', hi: 'भुजा 6 के वर्ग का परिमाप कितना है?' }, options: [{ en: '12', hi: '12' }, { en: '18', hi: '18' }, { en: '24', hi: '24' }, { en: '36', hi: '36' }], correctIndex: 2 },
    ]);

    await createQuizWithQuestions('math', { en: 'Number Patterns', hi: 'संख्या पैटर्न' }, 3, [
      { text: { en: 'What comes next: 2, 4, 8, 16, ?', hi: 'अगला क्या आएगा: 2, 4, 8, 16, ?' }, options: [{ en: '20', hi: '20' }, { en: '24', hi: '24' }, { en: '32', hi: '32' }, { en: '30', hi: '30' }], correctIndex: 2 },
      { text: { en: 'What is the next prime number after 7?', hi: '7 के बाद अगली अभाज्य संख्या कौन सी है?' }, options: [{ en: '8', hi: '8' }, { en: '9', hi: '9' }, { en: '10', hi: '10' }, { en: '11', hi: '11' }], correctIndex: 3 },
      { text: { en: 'What comes next: 1, 1, 2, 3, 5, ?', hi: 'अगला क्या आएगा: 1, 1, 2, 3, 5, ?' }, options: [{ en: '6', hi: '6' }, { en: '7', hi: '7' }, { en: '8', hi: '8' }, { en: '9', hi: '9' }], correctIndex: 2 },
      { text: { en: 'How many even numbers from 1 to 20?', hi: '1 से 20 तक कितनी सम संख्याएँ हैं?' }, options: [{ en: '8', hi: '8' }, { en: '9', hi: '9' }, { en: '10', hi: '10' }, { en: '11', hi: '11' }], correctIndex: 2 },
      { text: { en: 'What is the LCM of 4 and 6?', hi: '4 और 6 का LCM क्या है?' }, options: [{ en: '8', hi: '8' }, { en: '10', hi: '10' }, { en: '12', hi: '12' }, { en: '24', hi: '24' }], correctIndex: 2 },
    ]);

    // ---- GENERAL KNOWLEDGE ----
    await createQuizWithQuestions('gk', { en: 'India Basics', hi: 'भारत की मूल बातें' }, 1, [
      { text: { en: 'What is the capital of India?', hi: 'भारत की राजधानी क्या है?' }, options: [{ en: 'Mumbai', hi: 'मुंबई' }, { en: 'New Delhi', hi: 'नई दिल्ली' }, { en: 'Kolkata', hi: 'कोलकाता' }, { en: 'Chennai', hi: 'चेन्नई' }], correctIndex: 1 },
      { text: { en: 'How many states are in India?', hi: 'भारत में कितने राज्य हैं?' }, options: [{ en: '25', hi: '25' }, { en: '28', hi: '28' }, { en: '29', hi: '29' }, { en: '30', hi: '30' }], correctIndex: 1 },
      { text: { en: 'Which is the national animal of India?', hi: 'भारत का राष्ट्रीय पशु कौन सा है?' }, options: [{ en: 'Lion', hi: 'शेर' }, { en: 'Elephant', hi: 'हाथी' }, { en: 'Tiger', hi: 'बाघ' }, { en: 'Peacock', hi: 'मोर' }], correctIndex: 2 },
      { text: { en: 'Which river is the longest in India?', hi: 'भारत की सबसे लंबी नदी कौन सी है?' }, options: [{ en: 'Yamuna', hi: 'यमुना' }, { en: 'Ganga', hi: 'गंगा' }, { en: 'Godavari', hi: 'गोदावरी' }, { en: 'Narmada', hi: 'नर्मदा' }], correctIndex: 1 },
      { text: { en: 'What is the national flower of India?', hi: 'भारत का राष्ट्रीय फूल कौन सा है?' }, options: [{ en: 'Rose', hi: 'गुलाब' }, { en: 'Sunflower', hi: 'सूरजमुखी' }, { en: 'Lotus', hi: 'कमल' }, { en: 'Jasmine', hi: 'चमेली' }], correctIndex: 2 },
    ]);

    await createQuizWithQuestions('gk', { en: 'World Facts', hi: 'विश्व तथ्य' }, 2, [
      { text: { en: 'Which is the largest continent?', hi: 'सबसे बड़ा महाद्वीप कौन सा है?' }, options: [{ en: 'Africa', hi: 'अफ्रीका' }, { en: 'Asia', hi: 'एशिया' }, { en: 'Europe', hi: 'यूरोप' }, { en: 'North America', hi: 'उत्तर अमेरिका' }], correctIndex: 1 },
      { text: { en: 'Which planet is known as the Red Planet?', hi: 'किस ग्रह को लाल ग्रह कहा जाता है?' }, options: [{ en: 'Venus', hi: 'शुक्र' }, { en: 'Mars', hi: 'मंगल' }, { en: 'Jupiter', hi: 'बृहस्पति' }, { en: 'Saturn', hi: 'शनि' }], correctIndex: 1 },
      { text: { en: 'Which ocean is the largest?', hi: 'सबसे बड़ा महासागर कौन सा है?' }, options: [{ en: 'Atlantic', hi: 'अटलांटिक' }, { en: 'Indian', hi: 'हिंद' }, { en: 'Pacific', hi: 'प्रशांत' }, { en: 'Arctic', hi: 'आर्कटिक' }], correctIndex: 2 },
      { text: { en: 'How many continents are there?', hi: 'कितने महाद्वीप हैं?' }, options: [{ en: '5', hi: '5' }, { en: '6', hi: '6' }, { en: '7', hi: '7' }, { en: '8', hi: '8' }], correctIndex: 2 },
      { text: { en: 'Which country has the most population?', hi: 'किस देश की जनसंख्या सबसे अधिक है?' }, options: [{ en: 'USA', hi: 'अमेरिका' }, { en: 'India', hi: 'भारत' }, { en: 'China', hi: 'चीन' }, { en: 'Russia', hi: 'रूस' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('gk', { en: 'Famous Personalities', hi: 'प्रसिद्ध व्यक्तित्व' }, 2, [
      { text: { en: 'Who is known as the Father of the Nation?', hi: 'राष्ट्रपिता किसे कहा जाता है?' }, options: [{ en: 'Jawaharlal Nehru', hi: 'जवाहरलाल नेहरू' }, { en: 'Mahatma Gandhi', hi: 'महात्मा गांधी' }, { en: 'Subhas Chandra Bose', hi: 'सुभाष चंद्र बोस' }, { en: 'Bhagat Singh', hi: 'भगत सिंह' }], correctIndex: 1 },
      { text: { en: 'Who invented the telephone?', hi: 'टेलीफोन का आविष्कार किसने किया?' }, options: [{ en: 'Thomas Edison', hi: 'थॉमस एडिसन' }, { en: 'Alexander Graham Bell', hi: 'अलेक्जेंडर ग्राहम बेल' }, { en: 'Nikola Tesla', hi: 'निकोला टेस्ला' }, { en: 'Albert Einstein', hi: 'अल्बर्ट आइंस्टीन' }], correctIndex: 1 },
      { text: { en: 'Who wrote the national anthem of India?', hi: 'भारत का राष्ट्रगान किसने लिखा?' }, options: [{ en: 'Bankim Chandra', hi: 'बंकिम चंद्र' }, { en: 'Rabindranath Tagore', hi: 'रबीन्द्रनाथ टैगोर' }, { en: 'Sarojini Naidu', hi: 'सरोजिनी नायडू' }, { en: 'Premchand', hi: 'प्रेमचंद' }], correctIndex: 1 },
      { text: { en: 'Who was the first Indian in space?', hi: 'अंतरिक्ष में जाने वाले पहले भारतीय कौन थे?' }, options: [{ en: 'Kalpana Chawla', hi: 'कल्पना चावला' }, { en: 'Rakesh Sharma', hi: 'राकेश शर्मा' }, { en: 'Sunita Williams', hi: 'सुनीता विलियम्स' }, { en: 'APJ Abdul Kalam', hi: 'एपीजे अब्दुल कलाम' }], correctIndex: 1 },
      { text: { en: 'Who discovered gravity?', hi: 'गुरुत्वाकर्षण की खोज किसने की?' }, options: [{ en: 'Galileo', hi: 'गैलीलियो' }, { en: 'Newton', hi: 'न्यूटन' }, { en: 'Einstein', hi: 'आइंस्टीन' }, { en: 'Archimedes', hi: 'आर्किमिडीज़' }], correctIndex: 1 },
    ]);

    // ---- APTITUDE ----
    await createQuizWithQuestions('aptitude', { en: 'Logical Thinking', hi: 'तार्किक सोच' }, 1, [
      { text: { en: 'If Monday is Day 1, what day is Day 5?', hi: 'अगर सोमवार दिन 1 है, तो दिन 5 क्या है?' }, options: [{ en: 'Thursday', hi: 'गुरुवार' }, { en: 'Friday', hi: 'शुक्रवार' }, { en: 'Wednesday', hi: 'बुधवार' }, { en: 'Saturday', hi: 'शनिवार' }], correctIndex: 1 },
      { text: { en: 'Complete: 3, 6, 9, 12, ?', hi: 'पूरा करें: 3, 6, 9, 12, ?' }, options: [{ en: '13', hi: '13' }, { en: '14', hi: '14' }, { en: '15', hi: '15' }, { en: '16', hi: '16' }], correctIndex: 2 },
      { text: { en: 'If A=1, B=2, C=3, what is the value of CAB?', hi: 'अगर A=1, B=2, C=3, तो CAB का मान क्या है?' }, options: [{ en: '5', hi: '5' }, { en: '6', hi: '6' }, { en: '312', hi: '312' }, { en: '123', hi: '123' }], correctIndex: 1 },
      { text: { en: 'Which number is odd one out: 2, 4, 7, 8, 10?', hi: 'कौन सी संख्या अलग है: 2, 4, 7, 8, 10?' }, options: [{ en: '2', hi: '2' }, { en: '4', hi: '4' }, { en: '7', hi: '7' }, { en: '10', hi: '10' }], correctIndex: 2 },
      { text: { en: 'A clock shows 3:00. What is the angle between hands?', hi: 'एक घड़ी 3:00 दिखाती है। सुइयों के बीच कोण क्या है?' }, options: [{ en: '60°', hi: '60°' }, { en: '90°', hi: '90°' }, { en: '120°', hi: '120°' }, { en: '180°', hi: '180°' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('aptitude', { en: 'Word Problems', hi: 'शब्द समस्याएँ' }, 2, [
      { text: { en: 'Ram has 15 apples. He gives 1/3 to Shyam. How many does Shyam get?', hi: 'राम के पास 15 सेब हैं। वह 1/3 श्याम को देता है। श्याम को कितने मिलते हैं?' }, options: [{ en: '3', hi: '3' }, { en: '5', hi: '5' }, { en: '7', hi: '7' }, { en: '10', hi: '10' }], correctIndex: 1 },
      { text: { en: 'A train travels 60 km in 1 hour. How far in 2.5 hours?', hi: 'एक ट्रेन 1 घंटे में 60 किमी चलती है। 2.5 घंटे में कितनी दूर?' }, options: [{ en: '120 km', hi: '120 किमी' }, { en: '150 km', hi: '150 किमी' }, { en: '130 km', hi: '130 किमी' }, { en: '180 km', hi: '180 किमी' }], correctIndex: 1 },
      { text: { en: 'If 5 pens cost ₹35, what does 1 pen cost?', hi: 'अगर 5 पेन की कीमत ₹35 है, तो 1 पेन की कीमत क्या है?' }, options: [{ en: '₹5', hi: '₹5' }, { en: '₹6', hi: '₹6' }, { en: '₹7', hi: '₹7' }, { en: '₹8', hi: '₹8' }], correctIndex: 2 },
      { text: { en: 'A rectangular field is 20m long and 15m wide. What is its area?', hi: 'एक आयताकार मैदान 20 मीटर लंबा और 15 मीटर चौड़ा है। इसका क्षेत्रफल क्या है?' }, options: [{ en: '200 m²', hi: '200 वर्ग मीटर' }, { en: '300 m²', hi: '300 वर्ग मीटर' }, { en: '35 m²', hi: '35 वर्ग मीटर' }, { en: '70 m²', hi: '70 वर्ग मीटर' }], correctIndex: 1 },
      { text: { en: 'Sita is 8 years old. Her mother is 3 times her age. How old is her mother?', hi: 'सीता 8 साल की है। उसकी माँ उसकी उम्र से 3 गुना है। माँ कितनी साल की है?' }, options: [{ en: '20', hi: '20' }, { en: '22', hi: '22' }, { en: '24', hi: '24' }, { en: '28', hi: '28' }], correctIndex: 2 },
    ]);

    // ---- ENGLISH ----
    await createQuizWithQuestions('english', { en: 'Grammar Basics', hi: 'व्याकरण की मूल बातें' }, 1, [
      { text: { en: 'Which is a noun?', hi: 'कौन सा संज्ञा है?' }, options: [{ en: 'Run', hi: 'दौड़ना' }, { en: 'Beautiful', hi: 'सुंदर' }, { en: 'Dog', hi: 'कुत्ता' }, { en: 'Quickly', hi: 'जल्दी' }], correctIndex: 2 },
      { text: { en: 'Choose the correct sentence:', hi: 'सही वाक्य चुनें:' }, options: [{ en: 'He go to school.', hi: 'He go to school.' }, { en: 'He goes to school.', hi: 'He goes to school.' }, { en: 'He going to school.', hi: 'He going to school.' }, { en: 'He goed to school.', hi: 'He goed to school.' }], correctIndex: 1 },
      { text: { en: 'What is the plural of "child"?', hi: '"child" का बहुवचन क्या है?' }, options: [{ en: 'Childs', hi: 'Childs' }, { en: 'Childes', hi: 'Childes' }, { en: 'Children', hi: 'Children' }, { en: 'Childrens', hi: 'Childrens' }], correctIndex: 2 },
      { text: { en: 'Which word is a verb?', hi: 'कौन सा शब्द क्रिया है?' }, options: [{ en: 'Happy', hi: 'खुश' }, { en: 'Book', hi: 'किताब' }, { en: 'Sing', hi: 'गाना' }, { en: 'Blue', hi: 'नीला' }], correctIndex: 2 },
      { text: { en: '"She is ___ honest girl." Fill in the blank.', hi: '"She is ___ honest girl." रिक्त स्थान भरें।' }, options: [{ en: 'a', hi: 'a' }, { en: 'an', hi: 'an' }, { en: 'the', hi: 'the' }, { en: 'no article', hi: 'कोई article नहीं' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('english', { en: 'Vocabulary Builder', hi: 'शब्दावली निर्माण' }, 2, [
      { text: { en: 'What is the opposite of "brave"?', hi: '"brave" का विलोम क्या है?' }, options: [{ en: 'Strong', hi: 'मजबूत' }, { en: 'Cowardly', hi: 'कायर' }, { en: 'Bold', hi: 'साहसी' }, { en: 'Smart', hi: 'चतुर' }], correctIndex: 1 },
      { text: { en: 'What does "annual" mean?', hi: '"annual" का अर्थ क्या है?' }, options: [{ en: 'Daily', hi: 'दैनिक' }, { en: 'Weekly', hi: 'साप्ताहिक' }, { en: 'Monthly', hi: 'मासिक' }, { en: 'Yearly', hi: 'वार्षिक' }], correctIndex: 3 },
      { text: { en: 'Which word means "very happy"?', hi: 'किस शब्द का अर्थ "बहुत खुश" है?' }, options: [{ en: 'Sad', hi: 'उदास' }, { en: 'Delighted', hi: 'प्रसन्न' }, { en: 'Angry', hi: 'गुस्सा' }, { en: 'Tired', hi: 'थका हुआ' }], correctIndex: 1 },
      { text: { en: 'Synonym of "begin":', hi: '"begin" का पर्यायवाची:' }, options: [{ en: 'End', hi: 'समाप्त' }, { en: 'Start', hi: 'शुरू' }, { en: 'Stop', hi: 'रुकना' }, { en: 'Finish', hi: 'खत्म' }], correctIndex: 1 },
      { text: { en: 'What is a group of fish called?', hi: 'मछलियों के समूह को क्या कहते हैं?' }, options: [{ en: 'Herd', hi: 'झुंड' }, { en: 'Flock', hi: 'समूह' }, { en: 'School', hi: 'स्कूल' }, { en: 'Pack', hi: 'पैक' }], correctIndex: 2 },
    ]);

    // ---- HINDI ----
    await createQuizWithQuestions('hindi', { en: 'Hindi Grammar', hi: 'हिंदी व्याकरण' }, 1, [
      { text: { en: 'What is the gender of "पुस्तक"?', hi: '"पुस्तक" का लिंग क्या है?' }, options: [{ en: 'Masculine', hi: 'पुल्लिंग' }, { en: 'Feminine', hi: 'स्त्रीलिंग' }, { en: 'Neuter', hi: 'नपुंसकलिंग' }, { en: 'Common', hi: 'उभयलिंगी' }], correctIndex: 1 },
      { text: { en: 'What is the plural of "लड़का"?', hi: '"लड़का" का बहुवचन क्या है?' }, options: [{ en: 'लड़काएँ', hi: 'लड़काएँ' }, { en: 'लड़के', hi: 'लड़के' }, { en: 'लड़कियाँ', hi: 'लड़कियाँ' }, { en: 'लड़कों', hi: 'लड़कों' }], correctIndex: 1 },
      { text: { en: 'Which is a "सर्वनाम" (pronoun)?', hi: 'कौन सा "सर्वनाम" है?' }, options: [{ en: 'सुंदर', hi: 'सुंदर' }, { en: 'दौड़ना', hi: 'दौड़ना' }, { en: 'वह', hi: 'वह' }, { en: 'पेड़', hi: 'पेड़' }], correctIndex: 2 },
      { text: { en: 'What is the opposite of "सुख"?', hi: '"सुख" का विलोम क्या है?' }, options: [{ en: 'आनंद', hi: 'आनंद' }, { en: 'दुख', hi: 'दुख' }, { en: 'खुशी', hi: 'खुशी' }, { en: 'शांति', hi: 'शांति' }], correctIndex: 1 },
      { text: { en: 'How many vowels (स्वर) are in Hindi?', hi: 'हिंदी में कितने स्वर हैं?' }, options: [{ en: '9', hi: '9' }, { en: '11', hi: '11' }, { en: '13', hi: '13' }, { en: '15', hi: '15' }], correctIndex: 1 },
    ]);

    await createQuizWithQuestions('hindi', { en: 'Hindi Literature', hi: 'हिंदी साहित्य' }, 2, [
      { text: { en: 'Who wrote "Godan"?', hi: '"गोदान" किसने लिखा?' }, options: [{ en: 'Tulsidas', hi: 'तुलसीदास' }, { en: 'Premchand', hi: 'प्रेमचंद' }, { en: 'Kabir', hi: 'कबीर' }, { en: 'Surdas', hi: 'सूरदास' }], correctIndex: 1 },
      { text: { en: 'What is a "दोहा"?', hi: '"दोहा" क्या है?' }, options: [{ en: 'A story', hi: 'एक कहानी' }, { en: 'A couplet poem', hi: 'एक दोहा कविता' }, { en: 'A novel', hi: 'एक उपन्यास' }, { en: 'A letter', hi: 'एक पत्र' }], correctIndex: 1 },
      { text: { en: 'Who is called "Rastrakavi"?', hi: '"राष्ट्रकवि" किसे कहा जाता है?' }, options: [{ en: 'Maithili Sharan Gupt', hi: 'मैथिलीशरण गुप्त' }, { en: 'Kabir', hi: 'कबीर' }, { en: 'Premchand', hi: 'प्रेमचंद' }, { en: 'Tulsidas', hi: 'तुलसीदास' }], correctIndex: 0 },
      { text: { en: '"Ramcharitmanas" was written by?', hi: '"रामचरितमानस" किसने लिखा?' }, options: [{ en: 'Valmiki', hi: 'वाल्मीकि' }, { en: 'Tulsidas', hi: 'तुलसीदास' }, { en: 'Surdas', hi: 'सूरदास' }, { en: 'Kabir', hi: 'कबीर' }], correctIndex: 1 },
      { text: { en: 'What is "मुहावरा"?', hi: '"मुहावरा" क्या है?' }, options: [{ en: 'A proverb', hi: 'एक कहावत' }, { en: 'An idiom', hi: 'एक मुहावरा' }, { en: 'A poem', hi: 'एक कविता' }, { en: 'A word', hi: 'एक शब्द' }], correctIndex: 1 },
    ]);

    console.log('Quizzes and questions created (14 quizzes, 70 questions).');

    // ===================== BADGES =====================
    await Badge.create([
      { slug: 'first-quiz', name: { en: 'First Step', hi: 'पहला कदम' }, description: { en: 'Complete your first quiz', hi: 'अपनी पहली क्विज़ पूरी करें' }, icon: '⭐', criteria: { type: 'quizzes_completed', threshold: 1 }, points: 20 },
      { slug: 'quiz-5', name: { en: 'Quiz Explorer', hi: 'क्विज़ अन्वेषक' }, description: { en: 'Complete 5 quizzes', hi: '5 क्विज़ पूरी करें' }, icon: '🎯', criteria: { type: 'quizzes_completed', threshold: 5 }, points: 50 },
      { slug: 'quiz-10', name: { en: 'Quiz Master', hi: 'क्विज़ मास्टर' }, description: { en: 'Complete 10 quizzes', hi: '10 क्विज़ पूरी करें' }, icon: '🏆', criteria: { type: 'quizzes_completed', threshold: 10 }, points: 100 },
      { slug: 'quiz-25', name: { en: 'Quiz Champion', hi: 'क्विज़ चैंपियन' }, description: { en: 'Complete 25 quizzes', hi: '25 क्विज़ पूरी करें' }, icon: '👑', criteria: { type: 'quizzes_completed', threshold: 25 }, points: 200 },
      { slug: 'points-100', name: { en: 'Century', hi: 'शतक' }, description: { en: 'Earn 100 points', hi: '100 अंक अर्जित करें' }, icon: '💯', criteria: { type: 'points_total', threshold: 100 }, points: 10 },
      { slug: 'points-500', name: { en: 'Half Thousand', hi: 'आधा हज़ार' }, description: { en: 'Earn 500 points', hi: '500 अंक अर्जित करें' }, icon: '🔥', criteria: { type: 'points_total', threshold: 500 }, points: 50 },
      { slug: 'points-1000', name: { en: 'Grand Scholar', hi: 'महान विद्वान' }, description: { en: 'Earn 1000 points', hi: '1000 अंक अर्जित करें' }, icon: '🌟', criteria: { type: 'points_total', threshold: 1000 }, points: 100 },
      { slug: 'streak-3', name: { en: 'Three in a Row', hi: 'लगातार तीन' }, description: { en: '3-day learning streak', hi: '3 दिन लगातार पढ़ाई' }, icon: '🔥', criteria: { type: 'streak_days', threshold: 3 }, points: 15 },
      { slug: 'streak-7', name: { en: 'Week Warrior', hi: 'सप्ताह योद्धा' }, description: { en: '7-day learning streak', hi: '7 दिन लगातार पढ़ाई' }, icon: '💪', criteria: { type: 'streak_days', threshold: 7 }, points: 50 },
      { slug: 'streak-30', name: { en: 'Monthly Legend', hi: 'मासिक किंवदंती' }, description: { en: '30-day learning streak', hi: '30 दिन लगातार पढ़ाई' }, icon: '🏅', criteria: { type: 'streak_days', threshold: 30 }, points: 200 },
      { slug: 'perfect-1', name: { en: 'Perfect Score', hi: 'पूर्ण अंक' }, description: { en: 'Get a perfect score on any quiz', hi: 'किसी भी क्विज़ में पूर्ण अंक प्राप्त करें' }, icon: '💎', criteria: { type: 'perfect_score', threshold: 1 }, points: 25 },
      { slug: 'perfect-5', name: { en: 'Perfectionist', hi: 'पूर्णतावादी' }, description: { en: 'Get 5 perfect scores', hi: '5 बार पूर्ण अंक प्राप्त करें' }, icon: '✨', criteria: { type: 'perfect_score', threshold: 5 }, points: 100 },
    ]);

    console.log('Badges created: 12');

    // ===================== CODE PROBLEMS =====================
    await CodeProblem.create([
      {
        title: 'Sum of Two Numbers',
        description: 'Write a function `solution(a, b)` that returns the sum of `a` and `b`.',
        difficulty: 1,
        points: 50,
        initialCode: 'function solution(a, b) {\n  // your code here\n  \n}',
        testCases: [
          { input: '2, 3', expectedOutput: '5', hidden: false },
          { input: '-1, 5', expectedOutput: '4', hidden: false },
          { input: '10, 20', expectedOutput: '30', hidden: true },
        ],
      },
      {
        title: 'Find the Maximum',
        description: 'Write a function `solution(arr)` that takes an array of numbers and returns the largest number in the array.',
        difficulty: 2,
        points: 100,
        initialCode: 'function solution(arr) {\n  // your code here\n  \n}',
        testCases: [
          { input: '[1, 2, 3]', expectedOutput: '3', hidden: false },
          { input: '[10, -5, 20, 0]', expectedOutput: '20', hidden: false },
          { input: '[-5, -10, -2]', expectedOutput: '-2', hidden: true },
        ],
      },
    ]);
    console.log('Code problems created: 2');

    // ===================== GAME QUESTIONS =====================
    await GameQuestion.create([
      // 1. Math Battle
      { subjectSlug: 'math', gameSlug: 'math-battle', question: '12 + 8 = ?', options: ['18', '20', '22', '24'], answer: '20', xp: 10 },
      { subjectSlug: 'math', gameSlug: 'math-battle', question: '5 × 6 = ?', options: ['25', '30', '35', '36'], answer: '30', xp: 10 },
      { subjectSlug: 'math', gameSlug: 'math-battle', question: '45 ÷ 5 = ?', options: ['7', '8', '9', '10'], answer: '9', xp: 10 },
      
      // 2. Science Quiz
      { subjectSlug: 'science', gameSlug: 'science-quiz', question: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 'Carbon Dioxide', xp: 10 },
      { subjectSlug: 'science', gameSlug: 'science-quiz', question: 'Water boils at what temperature (Celsius)?', options: ['50', '90', '100', '120'], answer: '100', xp: 10 },
      
      // 3. Word Builder (English)
      { subjectSlug: 'english', gameSlug: 'word-builder', question: 'O-O-H-S-L-C', answer: 'SCHOOL', xp: 15 },
      { subjectSlug: 'english', gameSlug: 'word-builder', question: 'P-P-A-E-L', answer: 'APPLE', xp: 15 },
      
      // 4. Hindi Word Match (Hindi)
      { subjectSlug: 'hindi', gameSlug: 'hindi-match', question: 'Apple', options: ['केला', 'सेब', 'आम', 'अंगूर'], answer: 'सेब', xp: 10 },
      { subjectSlug: 'hindi', gameSlug: 'hindi-match', question: 'Water', options: ['पानी', 'आग', 'हवा', 'धरती'], answer: 'पानी', xp: 10 },
      
      // 5. GK Rapid Fire (General Knowledge)
      { subjectSlug: 'gk', gameSlug: 'gk-rapid-fire', question: 'Capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], answer: 'Delhi', xp: 10 },
      { subjectSlug: 'gk', gameSlug: 'gk-rapid-fire', question: 'National Animal of India?', options: ['Lion', 'Tiger', 'Elephant', 'Leopard'], answer: 'Tiger', xp: 10 },
      
      // 6. Code Blocks (Aptitude/Coding)
      { 
        subjectSlug: 'aptitude', 
        gameSlug: 'code-blocks', 
        question: 'Arrange to print "Hello"', 
        codeBlocks: ['print("Hello")', 'def say_hello():', 'say_hello()'], 
        correctOrder: [1, 0, 2], 
        xp: 20 
      },
    ]);
    console.log('Game questions created.');

    // ===================== DONE =====================
    console.log('\n--- Seed Complete ---');
    console.log('Login credentials:');
    console.log('  Admin:   admin@vidyaquest.com   / admin123');
    console.log('  Teacher: sunita@vidyaquest.com  / teacher123');
    console.log('  Teacher: rajesh@vidyaquest.com  / teacher123');
    console.log('  Student: aarav@vidyaquest.com   / student123');
    console.log('  Student: diya@vidyaquest.com    / student123');
    console.log('  Parent:  vikram@vidyaquest.com  / parent123');
    console.log('  Parent:  meera@vidyaquest.com   / parent123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
