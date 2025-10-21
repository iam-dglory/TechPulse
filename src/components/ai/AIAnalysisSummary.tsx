/**
 * AI Analysis Summary Component
 *
 * Displays comprehensive AI analysis for a company including
 * transparency, ethics, and risk assessments with insights
 */

'use client';

import React, { useState } from 'react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import AIInsightCard from './AIInsightCard';
import {
  Brain,
  TrendingUp,
  Shield,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AIAnalysisSummaryProps {
  companyId: string;
  companyName: string;
  className?: string;
}

/**
 * Score indicator component
 */
function ScoreIndicator({
  score,
  label,
  maxScore = 10,
}: {
  score: number;
  label: string;
  maxScore?: number;
}) {
  const percentage = (score / maxScore) * 100;
  const color =
    percentage >= 70
      ? 'bg-green-500'
      : percentage >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">
            {score.toFixed(1)}/{maxScore}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Expandable section component
 */
function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export default function AIAnalysisSummary({
  companyId,
  companyName,
  className = '',
}: AIAnalysisSummaryProps) {
  const { data, loading, error, refetch, hasAnalysis, isStale } =
    useAIAnalysis(companyId);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No analysis state
  if (!hasAnalysis) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            No AI analysis available for {companyName} yet. Analysis will be
            generated automatically.
          </p>
        </div>
      </div>
    );
  }

  const { analyses, insights, stats } = data!;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" />
              Powered by GPT-4
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Staleness warning */}
      {isStale && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Analysis may be outdated
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              This analysis is older than 7 days. Click refresh to generate a new
              analysis.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">
            {stats.total_analyses}
          </div>
          <div className="text-xs text-purple-600 mt-1">Analyses</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">
            {stats.total_insights}
          </div>
          <div className="text-xs text-blue-600 mt-1">Insights</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-900">
            {stats.high_severity_count}
          </div>
          <div className="text-xs text-orange-600 mt-1">High Priority</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {stats.avg_confidence ? `${parseFloat(stats.avg_confidence).toFixed(0)}%` : 'N/A'}
          </div>
          <div className="text-xs text-green-600 mt-1">Avg Confidence</div>
        </div>
      </div>

      {/* Transparency Analysis */}
      {analyses.transparency && (
        <ExpandableSection
          title="Transparency Analysis"
          icon={Shield}
          defaultExpanded={true}
        >
          <div className="space-y-4">
            <ScoreIndicator
              score={analyses.transparency.score}
              label="Transparency Score"
            />

            <div className="mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {analyses.transparency.summary}
              </p>
            </div>

            {analyses.transparency.strengths.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Strengths
                </h5>
                <ul className="space-y-2">
                  {analyses.transparency.strengths.map((strength, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyses.transparency.concerns.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Concerns
                </h5>
                <ul className="space-y-2">
                  {analyses.transparency.concerns.map((concern, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-orange-600 mt-0.5">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Ethics Analysis */}
      {analyses.ethics && (
        <ExpandableSection
          title="Ethics Evaluation"
          icon={TrendingUp}
          defaultExpanded={true}
        >
          <div className="space-y-4">
            <ScoreIndicator score={analyses.ethics.score} label="Ethics Score" />

            <div className="mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {analyses.ethics.recommendation}
              </p>
            </div>

            {analyses.ethics.positive_actions.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Positive Actions
                </h5>
                <ul className="space-y-2">
                  {analyses.ethics.positive_actions.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyses.ethics.red_flags.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Red Flags
                </h5>
                <ul className="space-y-2">
                  {analyses.ethics.red_flags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-red-600 mt-0.5">⚠</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Risk Assessment */}
      {analyses.risk && (
        <ExpandableSection title="Risk Assessment" icon={AlertTriangle}>
          <div className="space-y-4">
            <ScoreIndicator
              score={analyses.risk.risk_score}
              label="Risk Score"
            />

            <div className="mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {analyses.risk.overall_assessment}
              </p>
            </div>

            {analyses.risk.risk_categories.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">
                  Risk Categories
                </h5>
                <div className="space-y-3">
                  {analyses.risk.risk_categories.map((category, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            category.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : category.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : category.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {category.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {category.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Likelihood: {category.likelihood.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analyses.risk.mitigation_suggestions.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Mitigation Suggestions
                </h5>
                <ul className="space-y-2">
                  {analyses.risk.mitigation_suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* AI Insights */}
      {stats.total_insights > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Key Insights
          </h4>

          <div className="space-y-3">
            {/* Red Flags (highest priority) */}
            {insights.red_flags.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                type="red_flag"
              />
            ))}

            {/* Concerns */}
            {insights.concerns.slice(0, 3).map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} type="concern" />
            ))}

            {/* Strengths */}
            {insights.strengths.slice(0, 3).map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} type="strength" />
            ))}

            {/* Risks */}
            {insights.risks.slice(0, 2).map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} type="risk" />
            ))}

            {/* Opportunities */}
            {insights.opportunities.slice(0, 2).map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                type="opportunity"
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          AI-generated analysis last updated on{' '}
          {stats.last_analyzed
            ? new Date(stats.last_analyzed).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'N/A'}
          . This analysis is generated using advanced AI models and should be used
          as supplementary information alongside community votes and expert
          reviews.
        </p>
      </div>
    </div>
  );
}
