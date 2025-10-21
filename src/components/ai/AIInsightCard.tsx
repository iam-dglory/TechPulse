/**
 * AI Insight Card Component
 *
 * Displays individual AI-generated insights with severity indicators
 */

'use client';

import React from 'react';
import {
  AlertTriangle,
  Shield,
  Flag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface AIInsightCardProps {
  insight: {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number | null;
    created_at: string;
  };
  type: 'strength' | 'concern' | 'red_flag' | 'opportunity' | 'risk' | 'positive';
  className?: string;
}

/**
 * Get icon based on insight type
 */
function getInsightIcon(type: string) {
  switch (type) {
    case 'strength':
      return Shield;
    case 'concern':
      return AlertCircle;
    case 'red_flag':
      return Flag;
    case 'opportunity':
      return TrendingUp;
    case 'risk':
      return AlertTriangle;
    case 'positive':
      return CheckCircle;
    default:
      return AlertCircle;
  }
}

/**
 * Get color classes based on insight type and severity
 */
function getColorClasses(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
): {
  border: string;
  bg: string;
  icon: string;
  badge: string;
} {
  // Red flags and critical risks
  if (type === 'red_flag' || severity === 'critical') {
    return {
      border: 'border-red-500',
      bg: 'bg-red-50',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800',
    };
  }

  // High severity concerns/risks
  if (severity === 'high') {
    return {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800',
    };
  }

  // Medium severity
  if (severity === 'medium') {
    return {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800',
    };
  }

  // Strengths and positive insights
  if (type === 'strength' || type === 'positive' || type === 'opportunity') {
    return {
      border: 'border-green-500',
      bg: 'bg-green-50',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
    };
  }

  // Default (low severity)
  return {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  };
}

/**
 * Format insight type for display
 */
function formatInsightType(type: string): string {
  switch (type) {
    case 'red_flag':
      return 'Red Flag';
    case 'strength':
      return 'Strength';
    case 'concern':
      return 'Concern';
    case 'opportunity':
      return 'Opportunity';
    case 'risk':
      return 'Risk';
    case 'positive':
      return 'Positive';
    default:
      return type;
  }
}

/**
 * Format severity for display
 */
function formatSeverity(severity: string): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export default function AIInsightCard({
  insight,
  type,
  className = '',
}: AIInsightCardProps) {
  const Icon = getInsightIcon(type);
  const colors = getColorClasses(type, insight.severity);

  return (
    <div
      className={`relative rounded-lg border-l-4 ${colors.border} ${colors.bg} p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">
              {insight.title}
            </h4>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Type badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}
              >
                {formatInsightType(type)}
              </span>

              {/* Severity badge (only for high/critical) */}
              {(insight.severity === 'high' || insight.severity === 'critical') && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {formatSeverity(insight.severity)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {insight.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {/* AI Generated label */}
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
              AI Generated
            </span>

            {/* Confidence score */}
            {insight.confidence !== null && (
              <span>
                Confidence: {Math.round(insight.confidence * 100)}%
              </span>
            )}

            {/* Date */}
            <span className="ml-auto">
              {new Date(insight.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
