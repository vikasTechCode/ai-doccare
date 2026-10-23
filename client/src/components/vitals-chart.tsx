import { Vitals } from "@shared/schema";
import { Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface VitalsChartProps {
  vitals: Vitals[];
  className?: string;
}

export function VitalsChart({ vitals, className }: VitalsChartProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");

  const formatVitalsData = (vitals: Vitals[], range: string) => {
    const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return vitals
      .filter(v => v.recordedAt && new Date(v.recordedAt) >= cutoff)
      .map(v => ({
        date: v.recordedAt ? new Date(v.recordedAt).toLocaleDateString() : '',
        systolicBP: v.systolicBP || 0,
        diastolicBP: v.diastolicBP || 0,
        heartRate: v.heartRate || 0,
        weight: v.weight || 0,
      }))
      .reverse();
  };

  const chartData = formatVitalsData(vitals, timeRange);

  const getAverages = (data: any[]) => {
    if (data.length === 0) return { avgBP: "N/A", avgHR: "N/A", avgWeight: "N/A" };
    
    const avgSystolic = Math.round(data.reduce((sum, d) => sum + d.systolicBP, 0) / data.length);
    const avgDiastolic = Math.round(data.reduce((sum, d) => sum + d.diastolicBP, 0) / data.length);
    const avgHR = Math.round(data.reduce((sum, d) => sum + d.heartRate, 0) / data.length);
    const avgWeight = Math.round(data.reduce((sum, d) => sum + d.weight, 0) / data.length);
    
    return {
      avgBP: `${avgSystolic}/${avgDiastolic}`,
      avgHR: `${avgHR} bpm`,
      avgWeight: `${avgWeight} lbs`
    };
  };

  const averages = getAverages(chartData);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vitals Tracking</CardTitle>
          <div className="flex space-x-2">
            {["7D", "30D", "90D"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range as any)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="systolicBP"
                    stroke="hsl(214, 95%, 59%)"
                    strokeWidth={2}
                    name="Systolic BP"
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="hsl(158, 64%, 52%)"
                    strokeWidth={2}
                    name="Heart Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Avg BP</p>
                <p className="text-lg font-semibold text-slate-900">{averages.avgBP}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Avg HR</p>
                <p className="text-lg font-semibold text-slate-900">{averages.avgHR}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Weight</p>
                <p className="text-lg font-semibold text-slate-900">{averages.avgWeight}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-slate-600">No vitals data available</p>
              <p className="text-sm text-slate-500">Add your first reading to see trends</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
