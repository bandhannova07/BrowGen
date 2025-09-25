import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        about: 'About',
        learning: 'Learning Hub',
        community: 'Community',
        mentorship: 'Mentorship',
        blog: 'Blog',
        contact: 'Contact',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort'
      },
      // Auth
      auth: {
        welcome: 'Welcome to BrowGen',
        signupTitle: 'Create Your Account',
        loginTitle: 'Sign In',
        email: 'Email',
        password: 'Password',
        name: 'Full Name',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember me',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out'
      },
      // Learning
      learning: {
        courses: 'Courses',
        modules: 'Modules',
        progress: 'Progress',
        completed: 'Completed',
        inProgress: 'In Progress',
        notStarted: 'Not Started',
        startCourse: 'Start Course',
        continueCourse: 'Continue Course',
        courseComplete: 'Course Complete!',
        level: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
      },
      // Gamification
      gamification: {
        points: 'Points',
        badges: 'Badges',
        streak: 'Streak',
        leaderboard: 'Leaderboard',
        rank: 'Rank',
        totalPoints: 'Total Points',
        currentStreak: 'Current Streak',
        longestStreak: 'Longest Streak'
      },
      // Bro chatbot
      bro: {
        greeting: 'Hey there! 👋 I\'m Bro, your learning companion.',
        helpQuestion: 'How can I help you today?',
        findCourses: 'Find Courses',
        meetMentors: 'Meet Mentors',
        checkProgress: 'Check Progress',
        thanksBro: 'Thanks Bro!',
        keepGoing: 'Keep going! 💪 You\'re doing great.',
        consistency: 'Remember, consistency is key!'
      }
    }
  },
  bn: {
    translation: {
      // Navigation
      nav: {
        home: 'হোম',
        about: 'আমাদের সম্পর্কে',
        learning: 'Learning Hub',
        community: 'Community',
        mentorship: 'Mentorship',
        blog: 'Blog',
        contact: 'যোগাযোগ',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save করুন',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'দেখুন',
        back: 'পিছনে',
        next: 'পরবর্তী',
        previous: 'আগের',
        search: 'খুঁজুন',
        filter: 'Filter',
        sort: 'Sort'
      },
      // Auth
      auth: {
        welcome: 'BrowGen এ স্বাগতম',
        signupTitle: 'আপনার Account তৈরি করুন',
        loginTitle: 'Sign In করুন',
        email: 'Email',
        password: 'Password',
        name: 'পূর্ণ নাম',
        confirmPassword: 'Password নিশ্চিত করুন',
        forgotPassword: 'Password ভুলে গেছেন?',
        rememberMe: 'আমাকে মনে রাখুন',
        alreadyHaveAccount: 'ইতিমধ্যে account আছে?',
        dontHaveAccount: 'Account নেই?',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out'
      },
      // Learning
      learning: {
        courses: 'Courses',
        modules: 'Modules',
        progress: 'Progress',
        completed: 'সম্পন্ন',
        inProgress: 'চলমান',
        notStarted: 'শুরু হয়নি',
        startCourse: 'Course শুরু করুন',
        continueCourse: 'Course চালিয়ে যান',
        courseComplete: 'Course সম্পন্ন! 🎉',
        level: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
      },
      // Gamification
      gamification: {
        points: 'Points',
        badges: 'Badges',
        streak: 'Streak',
        leaderboard: 'Leaderboard',
        rank: 'Rank',
        totalPoints: 'মোট Points',
        currentStreak: 'বর্তমান Streak',
        longestStreak: 'সর্বোচ্চ Streak'
      },
      // Bro chatbot
      bro: {
        greeting: 'হ্যালো! 👋 আমি Bro, তোমার learning companion।',
        helpQuestion: 'আজ তোমাকে কীভাবে help করতে পারি?',
        findCourses: 'Courses খুঁজুন',
        meetMentors: 'Mentors এর সাথে দেখা',
        checkProgress: 'Progress দেখুন',
        thanksBro: 'ধন্যবাদ Bro!',
        keepGoing: 'চালিয়ে যাও! 💪 তুমি দারুণ করছো।',
        consistency: 'মনে রেখো, consistency হলো key!'
      }
    }
  },
  hi: {
    translation: {
      // Navigation
      nav: {
        home: 'होम',
        about: 'हमारे बारे में',
        learning: 'Learning Hub',
        community: 'Community',
        mentorship: 'Mentorship',
        blog: 'Blog',
        contact: 'संपर्क',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save करें',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'देखें',
        back: 'वापस',
        next: 'अगला',
        previous: 'पिछला',
        search: 'खोजें',
        filter: 'Filter',
        sort: 'Sort'
      },
      // Auth
      auth: {
        welcome: 'BrowGen में स्वागत है',
        signupTitle: 'अपना Account बनाएं',
        loginTitle: 'Sign In करें',
        email: 'Email',
        password: 'Password',
        name: 'पूरा नाम',
        confirmPassword: 'Password confirm करें',
        forgotPassword: 'Password भूल गए?',
        rememberMe: 'मुझे याद रखें',
        alreadyHaveAccount: 'पहले से account है?',
        dontHaveAccount: 'Account नहीं है?',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out'
      },
      // Learning
      learning: {
        courses: 'Courses',
        modules: 'Modules',
        progress: 'Progress',
        completed: 'पूरा हुआ',
        inProgress: 'चल रहा है',
        notStarted: 'शुरू नहीं हुआ',
        startCourse: 'Course शुरू करें',
        continueCourse: 'Course जारी रखें',
        courseComplete: 'Course पूरा हुआ! 🎉',
        level: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
      },
      // Gamification
      gamification: {
        points: 'Points',
        badges: 'Badges',
        streak: 'Streak',
        leaderboard: 'Leaderboard',
        rank: 'Rank',
        totalPoints: 'कुल Points',
        currentStreak: 'वर्तमान Streak',
        longestStreak: 'सबसे लंबा Streak'
      },
      // Bro chatbot
      bro: {
        greeting: 'नमस्ते! 👋 मैं Bro हूं, आपका learning companion।',
        helpQuestion: 'आज मैं आपकी कैसे help कर सकता हूं?',
        findCourses: 'Courses खोजें',
        meetMentors: 'Mentors से मिलें',
        checkProgress: 'Progress देखें',
        thanksBro: 'Thanks Bro!',
        keepGoing: 'चलते रहिए! 💪 आप बहुत अच्छा कर रहे हैं।',
        consistency: 'याद रखें, consistency ही key है!'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
