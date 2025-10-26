'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScoreHistoryChartProps {
  history: {
    date: string;
    overall_score?: number;
    privacy?: number;
    transparency?: number;
    labor?: number;
    environment?: number;
    community?: number;
  }[];
  title?: string;
}

export function ScoreHistoryChart({ history, title = 'Score History' }: ScoreHistoryChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overall_score');
  
  // Format dates for better display
  const formattedData = history.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const metrics = [
    { value: 'overall_score', label: 'Overall Score', color: '#4361ee' },
    { value: 'privacy', label: 'Privacy', color: '#3a0ca3' },
    { value: 'transparency', label: 'Transparency', color: '#7209b7' },
    { value: 'labor', label: 'Labor', color: '#f72585' },
    { value: 'environment', label: 'Environment', color: '#4cc9f0' },
    { value: 'community', label: 'Community', color: '#4ecdc4' },
  ];

  const selectedMetricColor = metrics.find(m => m.value === selectedMetric)?.color || '#4361ee';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metrics.map((metric) => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                formatter={(value) => [`${value}/100`, selectedMetric === 'overall_score' ? 'Overall Score' : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={selectedMetricColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}