'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';

interface BroOption {
  text: string;
  action: string;
  target?: string;
  nextNode?: string;
}

interface BroNode {
  id: string;
  message: string;
  options: BroOption[];
}

interface BroResponse {
  show: boolean;
  node?: string;
  message?: string;
  options?: BroOption[];
  settings?: {
    animation_duration: number;
  };
  reason?: string;
}

interface BroActionResponse {
  success: boolean;
  navigate?: string;
  close?: boolean;
  nextNode?: BroNode;
}

export function BroChat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentNode, setCurrentNode] = useState<BroNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger Bro based on page events
  const triggerBro = async (trigger: string, context: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      const response = await apiPost<BroResponse>('/api/bro/trigger', {
        trigger,
        context,
        language: 'en' // TODO: Get from i18n context
      });

      if (response.show && response.message && response.options) {
        setCurrentNode({
          id: response.node || 'unknown',
          message: response.message,
          options: response.options
        });
        setIsVisible(true);
        setIsMinimized(false);
      }
    } catch (error) {
      console.error('[BRO] Trigger failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle option click
  const handleOptionClick = async (option: BroOption) => {
    try {
      setIsLoading(true);
      
      const response = await apiPost<BroActionResponse>('/api/bro/action', {
        action: option.action,
        target: option.target,
        nextNode: option.nextNode,
        context: { language: 'en' }
      });

      if (response.navigate) {
        window.location.href = response.navigate;
        return;
      }

      if (response.close) {
        setIsVisible(false);
        setCurrentNode(null);
        return;
      }

      if (response.nextNode) {
        setCurrentNode(response.nextNode);
      } else {
        // Default close after action
        setTimeout(() => {
          setIsVisible(false);
          setCurrentNode(null);
        }, 2000);
      }
    } catch (error) {
      console.error('[BRO] Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerBro('page_load');
    }, 2000); // Delay to let page settle

    return () => clearTimeout(timer);
  }, []);

  // Listen for custom events (from other components)
  useEffect(() => {
    const handleBroTrigger = (event: CustomEvent) => {
      triggerBro(event.detail.trigger, event.detail.context);
    };

    window.addEventListener('bro-trigger', handleBroTrigger as EventListener);
    return () => window.removeEventListener('bro-trigger', handleBroTrigger as EventListener);
  }, []);

  if (!isVisible) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => triggerBro('help_request')}
        className="fixed bottom-6 right-6 z-50 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-glow hover:shadow-glow-accent transition-all duration-200"
        aria-label="Chat with Bro"
      >
        <MessageCircle size={24} />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: isMinimized ? 60 : 'auto'
        }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-sm w-80 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              B
            </div>
            <div>
              <div className="font-semibold">Bro</div>
              <div className="text-xs opacity-90">Your Learning Buddy</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <div className="w-4 h-0.5 bg-current"></div>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            {currentNode && (
              <>
                {/* Message */}
                <div className="mb-4">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-800">
                    {currentNode.message}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {currentNode.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleOptionClick(option)}
                      disabled={isLoading}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {option.text}
                    </motion.button>
                  ))}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="mt-3 flex justify-center">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to trigger Bro from other components
export function triggerBro(trigger: string, context: Record<string, any> = {}) {
  const event = new CustomEvent('bro-trigger', {
    detail: { trigger, context }
  });
  window.dispatchEvent(event);
}
