'use client';

import { useRouter } from 'next/navigation';
import { Button, Typography, Card, Avatar, List, Space, Tag } from 'antd';
import { 
  PlusOutlined,
  BarChartOutlined, 
  TeamOutlined,
  ArrowRightOutlined,
  FireOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ArrowUpOutlined,
  CommentOutlined,
  RetweetOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
import type { Variants, Transition } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    } as Transition
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
};

const { Title, Text } = Typography;

// Mock data for trending polls
const trendingPolls = [
  {
    id: '1',
    question: 'Which frontend framework do you prefer in 2025?',
    author: 'dev_explorer',
    votes: 1245,
    options: [
      { id: '1', text: 'React', percentage: 45 },
      { id: '2', text: 'Vue', percentage: 30 },
      { id: '3', text: 'Svelte', percentage: 15 },
      { id: '4', text: 'Angular', percentage: 10 },
    ],
    tags: ['#webdev', '#frontend', '#poll'],
    timeAgo: '2h',
    comments: 42,
    shares: 18
  },
  {
    id: '2',
    question: 'Best programming language for beginners in 2025?',
    author: 'code_mentor',
    votes: 892,
    options: [
      { id: '1', text: 'Python', percentage: 60 },
      { id: '2', text: 'JavaScript', percentage: 25 },
      { id: '3', text: 'Go', percentage: 10 },
      { id: '4', text: 'Rust', percentage: 5 },
    ],
    tags: ['#programming', '#beginners', '#coding'],
    timeAgo: '4h',
    comments: 36,
    shares: 12
  },
];

const features = [
  {
    icon: <PlusOutlined className="text-2xl" />,
    title: 'Create',
    description: 'Quickly create polls with multiple options',
  },
  {
    icon: <BarChartOutlined className="text-2xl" />,
    title: 'Analyze',
    description: 'Real-time results and analytics',
  },
  {
    icon: <TeamOutlined className="text-2xl" />,
    title: 'Engage',
    description: 'Share and get instant feedback',
  },
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trending');
  const [pollCode, setPollCode] = useState('');

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pollCode.trim()) {
      router.push(`/poll/${pollCode.trim()}`);
    }
  };

  const navigateToCreatePoll = () => {
    router.push('/create-poll');
  };

  const handleVote = (pollId: string, optionId: string) => {
    // Handle vote logic here
    console.log(`Voted for option ${optionId} in poll ${pollId}`);
  };

  return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 flex flex-col bg-gray-50 min-h-0"
      >
      {/* Navigation */}
      <motion.nav 
        variants={itemVariants}
        className="w-full bg-white shadow-sm sticky top-0 z-10"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              
              <span className="ml-2 text-xl font-bold text-gray-900">Vote-on-It</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="w-full bg-white py-4 md:py-8 flex-grow flex items-center"
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span className="block" variants={itemVariants}>
              Create and Share
            </motion.span>
            <motion.span 
              className="block text-indigo-600"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Instant Polls
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="mt-4 sm:mt-6 max-w-lg mx-auto text-base sm:text-lg text-gray-500 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Get instant feedback from your audience with our simple and powerful polling platform.
          </motion.p>
          
          <motion.div 
            className="mt-6 sm:mt-8 flex justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={navigateToCreatePoll}
              >
                Create Your First Poll
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

{/* Code Input Section */}
      <motion.section 
        className="py-4 md:py-8 bg-gradient-to-b from-white to-gray-50 flex-grow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Join an existing poll
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Enter the poll code below to view and vote
            </p>
          </motion.div>
          
          <motion.form 
            onSubmit={handleCodeSubmit}
            className="mt-6 sm:flex"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-full">
              <label htmlFor="poll-code" className="sr-only">Poll code</label>
              <input
                id="poll-code"
                type="text"
                value={pollCode}
                onChange={(e) => setPollCode(e.target.value)}
                className="block w-full px-4 py-3 sm:px-5 text-base rounded-md border border-gray-300 shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter poll code"
                required
              />
            </div>
            <motion.div 
              className="mt-3 sm:mt-0 sm:ml-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                className="block w-full px-5 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Join Poll
              </button>
            </motion.div>
          </motion.form>
          
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gray-50 text-sm text-gray-500">Or</span>
            </div>
          </div>
          
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              type="button"
              onClick={navigateToCreatePoll}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <PlusOutlined className="mr-2" />
              <span className="whitespace-nowrap">Create a new poll</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
      {/* CTA Section */}
      <motion.section 
        className="bg-indigo-700 w-full py-2 md:py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="w-full max-w-7xl mx-auto text-center py-4 px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-extrabold text-white sm:text-4xl"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="block">Ready to create your first poll?</span>
          </motion.h2>
          <motion.p 
            className="mt-3 sm:mt-4 text-sm sm:text-base leading-5 text-indigo-200 px-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join millions of users creating engaging polls
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="primary"
              size="large"
              className="mt-8 px-8 py-4 text-lg font-medium"
              onClick={navigateToCreatePoll}
            >
              Get Started for Free
            </Button>
          </motion.div>
        </div>
      </motion.section>
      </motion.div>
        
  );
}