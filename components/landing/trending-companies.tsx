'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Star, Users } from 'lucide-react';
import type { TrendingCompany } from '@/types/database';

interface TrendingCompaniesSectionProps {
  companies: TrendingCompany[];
}

export function TrendingCompaniesSection({ companies }: TrendingCompaniesSectionProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No trending companies at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {companies.map((company, index) => (
        <CompanyCard key={company.id} company={company} index={index} />
      ))}
    </div>
  );
}

interface CompanyCardProps {
  company: TrendingCompany;
  index: number;
}

function CompanyCard({ company, index }: CompanyCardProps) {
  const getVerificationBadge = (tier: string | null) => {
    const badges = {
      pioneer: { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', label: 'Pioneer' },
      exemplary: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Exemplary' },
      trusted: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', label: 'Trusted' },
      certified: { color: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30', label: 'Certified' },
    };
    return badges[tier as keyof typeof badges] || badges.certified;
  };

  const badge = getVerificationBadge(company.verification_tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/companies/${company.slug}`}>
        <motion.div
          className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 h-full"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Rank Badge */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>

          {/* Company Logo */}
          <div className="relative w-20 h-20 mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {company.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Company Name */}
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {company.name}
          </h3>

          {/* Verification Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color} mb-4`}>
            <Shield className="w-3.5 h-3.5" />
            {badge.label}
          </div>

          {/* Score & Growth */}
          <div className="space-y-3 mb-6">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Ethics Score</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {company.overall_score.toFixed(1)}/5.0
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(company.overall_score / 5) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>

            {/* Growth Rate */}
            {company.growth_rate > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  +{company.growth_rate.toFixed(1)}% growth
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {company.review_count} reviews
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {company.follower_count} followers
              </span>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
