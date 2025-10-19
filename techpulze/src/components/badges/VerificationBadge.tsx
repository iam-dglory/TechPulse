'use client'

import { motion } from 'framer-motion'
import { Shield, Star, Award, Sparkles } from 'lucide-react'
import { BadgeTier } from '@/types/database'
import { colors } from '@/lib/design-system'

interface VerificationBadgeProps {
  tier: BadgeTier
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const tierConfig = {
  none: {
    label: 'Not Verified',
    icon: Shield,
    gradient: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500',
    shadow: 'none',
    description: 'Company profile not yet verified',
  },
  certified: {
    label: 'Certified',
    icon: Shield,
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600',
    shadow: 'shadow-lg shadow-blue-500/30',
    description: 'Verified company with basic compliance',
  },
  trusted: {
    label: 'Trusted',
    icon: Star,
    gradient: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600',
    shadow: 'shadow-lg shadow-purple-500/30',
    description: 'Consistently ethical practices, strong community trust',
  },
  exemplary: {
    label: 'Exemplary',
    icon: Award,
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600',
    shadow: 'shadow-xl shadow-amber-500/30',
    description: 'Outstanding ethics record, industry leader',
  },
  pioneer: {
    label: 'Pioneer',
    icon: Sparkles,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600',
    shadow: 'shadow-2xl shadow-emerald-500/40',
    description: 'Highest ethical standards, transformative impact',
  },
}

const sizeConfig = {
  sm: {
    container: 'h-5 px-2',
    icon: 'w-3 h-3',
    text: 'text-xs',
    iconOnly: 'w-6 h-6 p-1',
  },
  md: {
    container: 'h-7 px-3',
    icon: 'w-4 h-4',
    text: 'text-sm',
    iconOnly: 'w-8 h-8 p-1.5',
  },
  lg: {
    container: 'h-9 px-4',
    icon: 'w-5 h-5',
    text: 'text-base',
    iconOnly: 'w-10 h-10 p-2',
  },
  xl: {
    container: 'h-12 px-5',
    icon: 'w-6 h-6',
    text: 'text-lg',
    iconOnly: 'w-14 h-14 p-3',
  },
}

export function VerificationBadge({
  tier,
  size = 'md',
  showLabel = true,
  animated = true,
  className = '',
}: VerificationBadgeProps) {
  const config = tierConfig[tier]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  const containerClass = showLabel
    ? `inline-flex items-center gap-1.5 rounded-full ${config.bgColor} ${sizes.container} font-medium ${config.textColor} ${config.shadow} ${className}`
    : `inline-flex items-center justify-center rounded-full ${config.bgColor} ${sizes.iconOnly} ${config.shadow} ${className}`

  const containerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
  }

  const iconVariants = {
    initial: { rotate: -180, scale: 0 },
    animate: {
      rotate: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      },
    },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
      },
    },
  }

  const glowVariants = {
    animate: {
      boxShadow: [
        '0 0 0px rgba(59, 130, 246, 0)',
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 0px rgba(59, 130, 246, 0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  }

  if (!animated) {
    return (
      <div className={containerClass}>
        <Icon className={`${sizes.icon} ${config.iconColor}`} />
        {showLabel && <span className={sizes.text}>{config.label}</span>}
      </div>
    )
  }

  return (
    <motion.div
      className={containerClass}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      title={config.description}
    >
      <motion.div variants={iconVariants}>
        <Icon className={`${sizes.icon} ${config.iconColor}`} />
      </motion.div>
      {showLabel && (
        <motion.span
          className={sizes.text}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {config.label}
        </motion.span>
      )}

      {/* Animated glow effect for pioneer tier */}
      {tier === 'pioneer' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          variants={glowVariants}
          animate="animate"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </motion.div>
  )
}

// Compact badge display (icon + tooltip)
export function VerificationBadgeCompact({
  tier,
  size = 'sm',
}: Pick<VerificationBadgeProps, 'tier' | 'size'>) {
  return <VerificationBadge tier={tier} size={size} showLabel={false} />
}

// Large display badge with description
export function VerificationBadgeFull({ tier }: { tier: BadgeTier }) {
  const config = tierConfig[tier]
  const Icon = config.icon

  if (tier === 'none') return null

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-6 ${config.bgColor} ${config.shadow}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`}
      />

      <div className="relative flex items-start gap-4">
        <motion.div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.shadow}`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-bold ${config.textColor}`}>
              {config.label}
            </h3>
            <div
              className={`h-2 w-2 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {config.description}
          </p>
        </div>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'linear',
        }}
      />
    </motion.div>
  )
}

// Helper function to get tier configuration
export function getBadgeTierConfig(tier: BadgeTier) {
  return tierConfig[tier]
}
