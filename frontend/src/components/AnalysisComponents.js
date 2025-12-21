import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BrandRadarChart = ({ data }) => {
  // Transform data for Recharts
  // data input: dimensions array from BrandScore
  // expected format: [{ subject: 'Math', A: 120, fullMark: 150 }]
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#0F172A"
            strokeWidth={2}
            fill="#0F172A"
            fillOpacity={0.1}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
             itemStyle={{ color: '#0F172A', fontFamily: 'Inter' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ScoreCard = ({ title, score, verdict, subtitle }) => {
    let colorClass = "text-slate-900";
    if (verdict === "GO") colorClass = "text-emerald-600";
    if (verdict === "CONDITIONAL GO") colorClass = "text-amber-600";
    if (verdict === "NO-GO" || verdict === "REJECT") colorClass = "text-red-600";

    return (
        <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-serif font-bold text-primary">{score}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                </div>
                {verdict && (
                    <div className={`mt-2 font-bold ${colorClass}`}>
                        {verdict}
                    </div>
                )}
                {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    );
};
