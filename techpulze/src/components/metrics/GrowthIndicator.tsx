'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface GrowthIndicatorProps {
  value: number // Percentage growth (-100 to +infinity)
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  animated?: boolean
  className?: string
}

type TrendType = 'up' | 'down' | 'neutral'

function getTrendType(value: number): TrendType {
  if (value > 0.5) return 'up'
  if (value < -0.5) return 'down'
  return 'neutral'
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
    animation: { y: [-2, 0, -2] },
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    gradient: 'from-red-500 to-orange-500',
    animation: { y: [2, 0, 2] },
  },
  neutral: {
    icon: Minus,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-800',
    gradient: 'from-gray-400 to-gray-500',
    animation: { x: [-2, 2, -2] },
  },
}

const sizeConfig = {
  sm: {
    container: 'h-6 px-2 text-xs',
    icon: 'w-3 h-3',
    badge: 'text-[10px]',
  },
  md: {
    container: 'h-8 px-3 text-sm',
    icon: 'w-4 h-4',
    badge: 'text-xs',
  },
  lg: {
    container: 'h-10 px-4 text-base',
    icon: 'w-5 h-5',
    badge: 'text-sm',
  },
}

export function GrowthIndicator({
  value,
  label,
  size = 'md',
  showValue = true,
  animated = true,
  className = '',
}: GrowthIndicatorProps) {
  const trend = getTrendType(value)
  const config = trendConfig[trend]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  const formattedValue = value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`

  const containerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  }

  const iconVariants = {
    animate: animated ? config.animation : {},
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut',
    },
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${sizes.container} font-medium ${config.color}`}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          animate={animated ? iconVariants.animate : {}}
          transition={iconVariants.transition}
        >
          <Icon className={sizes.icon} strokeWidth={2.5} />
        </motion.div>

        {showValue && (
          <motion.span
            className="font-semibold tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {formattedValue}
          </motion.span>
        )}
      </motion.div>

      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  )
}

// Compact version with just icon and value
export function GrowthIndicatorCompact({
  value,
  size = 'sm',
}: Pick<GrowthIndicatorProps, 'value' | 'size'>) {
  return <GrowthIndicator value={value} size={size} showValue={true} />
}

// Large card display with additional context
export function GrowthCard({
  value,
  label,
  period = 'vs last month',
  subtitle,
}: {
  value: number
  label: string
  period?: string
  subtitle?: string
}) {
  const trend = getTrendType(value)
  const config = trendConfig[trend]
  const Icon = config.icon

  return (
    <motion.div
      className={`rounded-xl p-4 ${config.bgColor} border ${config.borderColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <motion.div
              className={`inline-flex items-center gap-1 ${config.color} font-bold text-2xl`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <Icon className="w-6 h-6" strokeWidth={2.5} />
              <span className="tabular-nums">
                {value >= 0 ? '+' : ''}
                {value.toFixed(1)}%
              </span>
            </motion.div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {period}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Animated background gradient */}
        <motion.div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} opacity-10`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </div>
    </motion.div>
  )
}

// Multiple metrics display
export function GrowthMetrics({
  metrics,
}: {
  metrics: Array<{
    label: string
    value: number
    subtitle?: string
  }>
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GrowthCard {...metric} />
        </motion.div>
      ))}
    </div>
  )
}

// Inline growth badge (minimal)
export function GrowthBadge({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const trend = getTrendType(value)
  const config = trendConfig[trend]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor} ${className}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      <span className="tabular-nums">
        {value >= 0 ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    </span>
  )
}
