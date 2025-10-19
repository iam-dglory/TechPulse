'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { CompanyMetricsHistory } from '@/types/database'

interface MetricsChartProps {
  data: CompanyMetricsHistory[]
  metrics?: Array<'ethics_score' | 'impact_score' | 'innovation_score' | 'follower_count'>
  type?: 'line' | 'area'
  height?: number
  showLegend?: boolean
  animated?: boolean
}

const metricConfig = {
  ethics_score: {
    label: 'Ethics Score',
    color: '#3b82f6', // blue-500
    dataKey: 'ethics_score',
  },
  impact_score: {
    label: 'Impact Score',
    color: '#8b5cf6', // purple-500
    dataKey: 'impact_score',
  },
  innovation_score: {
    label: 'Innovation Score',
    color: '#f59e0b', // amber-500
    dataKey: 'innovation_score',
  },
  follower_count: {
    label: 'Followers',
    color: '#10b981', // emerald-500
    dataKey: 'follower_count',
  },
}

export function MetricsChart({
  data,
  metrics = ['ethics_score', 'impact_score', 'innovation_score'],
  type = 'line',
  height = 300,
  showLegend = true,
  animated = true,
}: MetricsChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    date: format(parseISO(item.metric_date), 'MMM dd'),
    fullDate: item.metric_date,
    ethics_score: item.ethics_score,
    impact_score: item.impact_score,
    innovation_score: item.innovation_score,
    follower_count: item.follower_count,
    average_rating: item.average_rating,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <motion.div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          const config = metricConfig[entry.dataKey as keyof typeof metricConfig]
          if (!config) return null

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {config.label}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {typeof entry.value === 'number'
                  ? entry.value.toFixed(1)
                  : entry.value}
              </span>
            </div>
          )
        })}
      </motion.div>
    )
  }

  const Chart = type === 'area' ? AreaChart : LineChart

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {metrics.map((metricKey) => {
              const config = metricConfig[metricKey]
              return (
                <linearGradient
                  key={metricKey}
                  id={`gradient-${metricKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            opacity={0.5}
          />

          <XAxis
            dataKey="date"
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />

          <YAxis
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            style={{ fontSize: '12px' }}
            tickLine={false}
            domain={[0, 10]}
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => {
                const config = metricConfig[value as keyof typeof metricConfig]
                return config ? config.label : value
              }}
            />
          )}

          {metrics.map((metricKey) => {
            const config = metricConfig[metricKey]

            if (type === 'area') {
              return (
                <Area
                  key={metricKey}
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${metricKey})`}
                  animationDuration={animated ? 1000 : 0}
                  animationEasing="ease-in-out"
                />
              )
            }

            return (
              <Line
                key={metricKey}
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={animated ? 1000 : 0}
                animationEasing="ease-in-out"
              />
            )
          })}
        </Chart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Compact metrics display
export function MetricsChartCard({
  data,
  title,
  subtitle,
  metrics,
}: {
  data: CompanyMetricsHistory[]
  title: string
  subtitle?: string
  metrics?: MetricsChartProps['metrics']
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-400 text-5xl mb-3">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            No historical data available yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Metrics will be tracked over time
          </p>
        </div>
      ) : (
        <MetricsChart data={data} metrics={metrics} height={250} />
      )}
    </motion.div>
  )
}

// Mini sparkline chart (compact view)
export function MetricsSparkline({
  data,
  metric = 'ethics_score',
  color = '#3b82f6',
  height = 40,
}: {
  data: CompanyMetricsHistory[]
  metric?: keyof typeof metricConfig
  color?: string
  height?: number
}) {
  const chartData = data.map((item) => ({
    value: item[metricConfig[metric].dataKey as keyof CompanyMetricsHistory],
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
