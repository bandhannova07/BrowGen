'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface HeroProps {
  variant?: 'default' | 'minimal' | 'feature-rich';
}

export function Hero({ variant = 'default' }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (variant === 'minimal') {
    return (
      <section className="relative min-h-[60vh] bg-gradient-hero flex items-center">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-display font-bold text-neutral-900 mb-6"
            >
              Learn to Code with{' '}
              <span className="text-primary-600">Confidence</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
            >
              Master programming through interactive lessons, real projects, and personalized guidance from Bro.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex gap-4 justify-center">
              <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                Start Learning Free
              </Button>
              <Button variant="outline" size="lg">
                View Courses
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'feature-rich') {
    return (
      <section className="relative min-h-screen bg-gradient-hero flex items-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award size={16} />
                Trusted by 10,000+ learners
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-7xl font-display font-bold text-neutral-900 mb-6 leading-tight"
              >
                Code Your
                <br />
                <span className="text-primary-600">Future</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-neutral-600 mb-8 leading-relaxed"
              >
                Join thousands of developers who've transformed their careers with our interactive, project-based learning platform. Get personalized guidance, earn achievements, and build real applications.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="xl" rightIcon={<ArrowRight size={24} />} className="shadow-2xl">
                  Start Your Journey
                </Button>
                <Button variant="outline" size="xl">
                  Explore Courses
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-8 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  50+ Interactive Courses
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  Expert Mentors
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} />
                  Industry Certificates
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <Card variant="elevated" className="p-4 hover:shadow-glow transition-all duration-300">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen size={16} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Interactive Learning</h3>
                  <p className="text-sm text-neutral-600">Hands-on coding exercises</p>
                </Card>

                <Card variant="elevated" className="p-4 mt-8 hover:shadow-glow-accent transition-all duration-300">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mb-3">
                    <Award size={16} className="text-accent-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Gamified Progress</h3>
                  <p className="text-sm text-neutral-600">Earn points and badges</p>
                </Card>

                <Card variant="elevated" className="p-4 -mt-4 hover:shadow-glow transition-all duration-300">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mb-3">
                    <Users size={16} className="text-success-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Expert Mentors</h3>
                  <p className="text-sm text-neutral-600">1-on-1 guidance</p>
                </Card>

                <Card variant="elevated" className="p-4 mt-4 hover:shadow-glow-accent transition-all duration-300">
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen size={16} className="text-warning-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Real Projects</h3>
                  <p className="text-sm text-neutral-600">Build portfolio apps</p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="relative min-h-[80vh] bg-gradient-hero flex items-center">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6"
          >
            Master Programming with{' '}
            <span className="text-primary-600">BrowGen</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
          >
            Interactive courses, real projects, and AI-powered guidance to help you become a confident developer.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" rightIcon={<ArrowRight size={20} />}>
              Start Learning Today
            </Button>
            <Button variant="outline" size="lg">
              Browse Courses
            </Button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-neutral-600">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">50+</div>
              <div className="text-neutral-600">Expert Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">95%</div>
              <div className="text-neutral-600">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
