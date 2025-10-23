'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, MessageSquare, TrendingUp, Award } from 'lucide-react';

interface StatsCounterProps {
  companies: number;
  reviews: number;
  growing: number;
  pioneer: number;
}

export function StatsCounter({ companies, reviews, growing, pioneer }: StatsCounterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <StatItem
        icon={Building2}
        value={companies}
        label="Companies Rated"
        suffix=""
      />
      <StatItem
        icon={MessageSquare}
        value={reviews}
        label="Reviews Submitted"
        suffix=""
      />
      <StatItem
        icon={TrendingUp}
        value={growing}
        label="Companies Growing"
        suffix=""
      />
      <StatItem
        icon={Award}
        value={pioneer}
        label="Pioneer Certified"
        suffix=""
      />
    </div>
  );
}

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
}

function StatItem({ icon: Icon, value, label, suffix = '' }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
        {formatNumber(count)}
        {suffix}
      </div>
      <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
        {label}
      </div>
    </motion.div>
  );
}
