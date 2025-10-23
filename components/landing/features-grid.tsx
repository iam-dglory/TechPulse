'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  TrendingUp,
  Users,
  Sparkles,
  BarChart3,
  Bell,
  Lock,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Reviews',
    description: 'All reviews are moderated and verified to ensure authenticity and prevent fake ratings.',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI algorithms analyze company practices across multiple ethics dimensions.',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Updates',
    description: 'Track company ethics scores over time with live updates and historical trends.',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built by employees, customers, and investors sharing real experiences.',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Metrics',
    description: 'Multi-dimensional scoring across privacy, transparency, labor, environment, and community.',
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified about important updates from companies you follow.',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data is secure and never shared without your explicit consent.',
    color: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with cutting-edge technology for instant search and smooth interactions.',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="group"
        >
          <div className="relative h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-6 h-6" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {feature.description}
            </p>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-50/0 to-slate-100/0 dark:from-slate-700/0 dark:to-slate-800/0 group-hover:from-slate-50/50 group-hover:to-slate-100/50 dark:group-hover:from-slate-700/20 dark:group-hover:to-slate-800/20 transition-all duration-300 pointer-events-none" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
