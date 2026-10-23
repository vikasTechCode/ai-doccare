import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Brain, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SymptomAnalysisResult {
  possibleCauses: string[];
  recommendation: string;
  urgencyLevel: "low" | "medium" | "high";
  whenToSeeDoctor: string;
  disclaimer: string;
}

export function SymptomChecker() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState<SymptomAnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analyze-symptoms", {
        symptoms,
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
  });

  const handleAnalyze = () => {
    if (!symptoms.trim()) return;
    analyzeMutation.mutate();
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-800 bg-red-50 border-red-200";
      case "medium": return "text-orange-800 bg-orange-50 border-orange-200";
      case "low": return "text-green-800 bg-green-50 border-green-200";
      default: return "text-blue-800 bg-blue-50 border-blue-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="text-purple-600 h-5 w-5" />
          </div>
          <div>
            <CardTitle>AI Symptom Checker</CardTitle>
            <p className="text-sm text-slate-600">Describe your symptoms for AI analysis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="symptoms">What symptoms are you experiencing?</Label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., headache, fever, cough..."
            rows={3}
            className="mt-2"
          />
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          className="w-full"
          disabled={!symptoms.trim() || analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Symptoms...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Analyze Symptoms with AI
            </>
          )}
        </Button>

        {analysis && (
          <div className={`border rounded-lg p-4 ${getUrgencyColor(analysis.urgencyLevel)}`}>
            <h4 className="font-medium mb-3 flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              AI Analysis Results:
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Possible Causes:</strong>
                <ul className="list-disc list-inside mt-1">
                  {analysis.possibleCauses.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Recommendation:</strong> {analysis.recommendation}
              </div>
              <div>
                <strong>When to see a doctor:</strong> {analysis.whenToSeeDoctor}
              </div>
              <div>
                <strong>Urgency Level:</strong> 
                <span className="ml-1 font-medium capitalize">{analysis.urgencyLevel}</span>
              </div>
            </div>
            <Alert className="mt-4 border-amber-300 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {analysis.disclaimer}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {analyzeMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze symptoms. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
