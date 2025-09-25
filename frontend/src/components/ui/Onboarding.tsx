'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Code, Palette, Database, Globe, Smartphone, Brain } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface Interest {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const interests: Interest[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    icon: <Code size={24} />,
    description: 'HTML, CSS, JavaScript, React',
    color: 'bg-primary-100 text-primary-600 border-primary-200'
  },
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    icon: <Palette size={24} />,
    description: 'Design principles, Figma, user research',
    color: 'bg-accent-100 text-accent-600 border-accent-200'
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: <Database size={24} />,
    description: 'APIs, databases, server architecture',
    color: 'bg-success-100 text-success-600 border-success-200'
  },
  {
    id: 'fullstack',
    name: 'Full Stack',
    icon: <Globe size={24} />,
    description: 'End-to-end application development',
    color: 'bg-warning-100 text-warning-600 border-warning-200'
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    icon: <Smartphone size={24} />,
    description: 'React Native, Flutter, iOS, Android',
    color: 'bg-purple-100 text-purple-600 border-purple-200'
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: <Brain size={24} />,
    description: 'Python, TensorFlow, data science',
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200'
  }
];

interface OnboardingProps {
  onComplete: (data: { interests: string[], experience: string, goal: string }) => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [goal, setGoal] = useState('');

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BrowGen! 👋',
      description: 'Let\'s personalize your learning journey in just 3 quick steps.',
      component: (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Code size={32} className="text-primary-600" />
          </motion.div>
          <p className="text-lg text-neutral-600 mb-8">
            We'll help you discover the perfect courses and create a learning path tailored just for you.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <span>Takes less than 2 minutes</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-neutral-300 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interests',
      title: 'What interests you most?',
      description: 'Select all areas you\'d like to explore (you can always change this later).',
      component: (
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interests.map((interest) => (
              <motion.div
                key={interest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: interests.indexOf(interest) * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedInterests.includes(interest.id)
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedInterests(prev =>
                      prev.includes(interest.id)
                        ? prev.filter(id => id !== interest.id)
                        : [...prev, interest.id]
                    );
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${interest.color}`}>
                        {interest.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {interest.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {interest.description}
                        </p>
                      </div>
                      {selectedInterests.includes(interest.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary-500"
                        >
                          <Check size={20} />
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'experience',
      title: 'What\'s your experience level?',
      description: 'This helps us recommend the right starting point for you.',
      component: (
        <div className="py-4 space-y-4">
          {[
            { id: 'beginner', label: 'Complete Beginner', desc: 'New to programming and tech' },
            { id: 'some-experience', label: 'Some Experience', desc: 'Built a few projects or taken courses' },
            { id: 'intermediate', label: 'Intermediate', desc: 'Comfortable with basics, ready for advanced topics' },
            { id: 'advanced', label: 'Advanced', desc: 'Looking to specialize or learn new technologies' }
          ].map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  experience === level.id
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setExperience(level.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {level.label}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {level.desc}
                      </p>
                    </div>
                    {experience === level.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary-500"
                      >
                        <Check size={20} />
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'goal',
      title: 'What\'s your main goal?',
      description: 'We\'ll customize your dashboard and recommendations based on this.',
      component: (
        <div className="py-4 space-y-4">
          {[
            { id: 'career-change', label: 'Career Change', desc: 'Switch to a tech career' },
            { id: 'skill-upgrade', label: 'Skill Upgrade', desc: 'Advance in my current role' },
            { id: 'side-project', label: 'Side Projects', desc: 'Build apps and websites for fun' },
            { id: 'freelancing', label: 'Freelancing', desc: 'Start freelancing or consulting' },
            { id: 'startup', label: 'Start a Business', desc: 'Build my own tech startup' },
            { id: 'learning', label: 'Just Learning', desc: 'Explore and learn new things' }
          ].map((goalOption, index) => (
            <motion.div
              key={goalOption.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  goal === goalOption.id
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setGoal(goalOption.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {goalOption.label}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {goalOption.desc}
                      </p>
                    </div>
                    {goal === goalOption.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary-500"
                      >
                        <Check size={20} />
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return selectedInterests.length > 0;
      case 2: return experience !== '';
      case 3: return goal !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({ interests: selectedInterests, experience, goal });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-hero p-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary-500' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-neutral-500 hover:text-neutral-700 text-sm"
            >
              Skip for now
            </button>
          </div>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-neutral-600">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutral-50 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back
          </Button>

          <div className="text-sm text-neutral-500">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            rightIcon={<ArrowRight size={16} />}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
