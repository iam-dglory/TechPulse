'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Share2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { NewsArticle } from '@/types/database';

interface FeaturedStoryProps {
  article: NewsArticle;
}

export function FeaturedStory({ article }: FeaturedStoryProps) {
  const getImpactBadge = (impact: string) => {
    const badges = {
      very_positive: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Very Positive Impact' },
      positive: { color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500', icon: CheckCircle, label: 'Positive Impact' },
      neutral: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: TrendingUp, label: 'Neutral Impact' },
      negative: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle, label: 'Negative Impact' },
      very_negative: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle, label: 'Very Negative Impact' },
    };
    return badges[impact as keyof typeof badges] || badges.neutral;
  };

  const badge = getImpactBadge(article.ethics_impact);
  const Icon = badge.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || '',
          url: `/news/${article.slug}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/news/${article.slug}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Featured Badge */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
        Featured Story
      </div>

      <Link href={`/news/${article.slug}`}>
        {/* Hero Image */}
        <div className="relative aspect-[21/9] bg-slate-100 dark:bg-slate-800">
          {article.thumbnail_url ? (
            <Image
              src={article.thumbnail_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-slate-400">📰</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Ethics Impact Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
              <Icon className="w-4 h-4" />
              {badge.label}
            </div>

            {/* Hype Score */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
              <span className="text-slate-600 dark:text-slate-400">Hype Score:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {article.hype_score.toFixed(1)}/10
              </span>
            </div>

            {/* Credibility Score */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm">
              <span className="text-blue-600 dark:text-blue-400">Credibility:</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {article.credibility_score.toFixed(1)}/10
              </span>
            </div>

            {article.fact_checked && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Fact Checked
              </div>
            )}
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {article.title}
          </h2>

          {/* Summary */}
          {article.summary && (
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
              {article.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at)}
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {article.discussion_count} discussions
            </div>
            {article.source_name && (
              <div>
                Source: <span className="font-medium">{article.source_name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions Footer */}
      <div className="px-8 pb-8 flex flex-wrap gap-3">
        <Link
          href={`/news/${article.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Read Full Analysis
        </Link>
        <Link
          href={`/news/${article.slug}#discussions`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Join Discussion
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </motion.div>
  );
}
