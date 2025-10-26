'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Diamond, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScoreDisplayProps {
  company: {
    overall_score: number;
    ethics_scores?: {
      privacy: number;
      transparency: number;
      security: number;
      fairness: number;
      environmental: number;
    };
    score_history?: Array<{
      date: string;
      score: number;
    }>;
  };
}

export default function ScoreDisplay({ company }: ScoreDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const ethicsScores = company.ethics_scores || {
    privacy: 0,
    transparency: 0,
    security: 0,
    fairness: 0,
    environmental: 0
  };
  
  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const scoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (score >= 40) return <Info className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const scoreVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Diamond */}
        <motion.div 
          className="relative"
          initial="hidden"
          animate="visible"
          variants={scoreVariants}
        >
          <Diamond className="h-24 w-24 md:h-32 md:w-32 text-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-3xl md:text-4xl font-bold ${scoreColor(company.overall_score)}`}>
                {company.overall_score}
              </span>
              <span className="block text-xs text-muted-foreground">SCORE</span>
            </div>
          </div>
        </motion.div>

        {/* Score Summary */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-xl font-semibold">Ethics Score</h3>
          <p className="text-sm text-muted-foreground">
            This score represents the company's ethical performance based on reviews, 
            news analysis, and verified data.
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1"
          >
            {showDetails ? 'Hide details' : 'Show details'}
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <motion.div
        initial="hidden"
        animate={showDetails ? "visible" : "hidden"}
        variants={detailsVariants}
        className="overflow-hidden"
      >
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Ethics Breakdown</h4>
          
          <div className="space-y-3">
            {Object.entries(ethicsScores).map(([category, score]) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scoreIcon(score)}
                    <span className="text-sm capitalize">{category}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-sm font-medium ${scoreColor(score)}`}>{score}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Based on {category} metrics and reviews</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
          
          {company.score_history && company.score_history.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Score History</h4>
              <div className="h-32 relative">
                {/* Simple chart visualization - in a real app, use a proper chart library */}
                <div className="absolute inset-0 flex items-end">
                  {company.score_history.map((point, index) => (
                    <div 
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div 
                        className="w-full bg-primary/20 rounded-t"
                        style={{ height: `${point.score}%` }}
                      >
                        <div 
                          className="w-full bg-primary rounded-t" 
                          style={{ height: `${point.score}%` }}
                        />
                      </div>
                      <span className="text-xs mt-1 text-muted-foreground">
                        {new Date(point.date).toLocaleDateString(undefined, { month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}