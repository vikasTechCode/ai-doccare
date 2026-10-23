import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { VitalsChart } from "@/components/vitals-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Activity, Heart, Thermometer, Scale, AlertCircle } from "lucide-react";

export default function Vitals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingVitals, setIsAddingVitals] = useState(false);
  const [formData, setFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    weight: "",
    height: "",
    temperature: "",
    bloodSugar: "",
  });

  
  
const { data: vitals = [] } = useQuery<{
  id: number;
  userId: number;
  systolicBP: number | null;
  diastolicBP: number | null;
  heartRate: number | null;
  weight: number | null;
  height: number | null;
  temperature: number | null;
  bloodSugar: number | null;
  recordedAt: Date | string | null;
}[]>({
  queryKey: [`/api/vitals/${user?.id}`, user?.id],
  enabled: !!user,
});


  
const { data: latestVitals } = useQuery<{
  id: number;
  userId: number;
  systolicBP: number | null;
  diastolicBP: number | null;
  heartRate: number | null;
  weight: number | null;
  height: number | null;
  temperature: number | null;
  bloodSugar: number | null;
  recordedAt: Date | string | null;
} | null>({
  queryKey: [`/api/vitals/${user?.id}/latest`, user?.id],
  enabled: !!user,
});



  const addVitalsMutation = useMutation({
    mutationFn: async (vitalsData: any) => {
      const response = await apiRequest("POST", "/api/vitals", {
        ...vitalsData,
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      
  queryClient.invalidateQueries({
    queryKey: [`/api/vitals/${user?.id}`],
  });

  queryClient.invalidateQueries({
    queryKey: [`/api/vitals/${user?.id}/latest`],
  });

      setIsAddingVitals(false);
      setFormData({
        systolicBP: "",
        diastolicBP: "",
        heartRate: "",
        weight: "",
        height: "",
        temperature: "",
        bloodSugar: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vitalsData = {
      systolicBP: formData.systolicBP ? parseInt(formData.systolicBP) : null,
      diastolicBP: formData.diastolicBP ? parseInt(formData.diastolicBP) : null,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      bloodSugar: formData.bloodSugar ? parseInt(formData.bloodSugar) : null,
    };
    addVitalsMutation.mutate(vitalsData);
  };

  const getVitalStatus = (value: number | null, type: string) => {
    if (!value) return "normal";
    
    switch (type) {
      case "systolic":
        if (value < 90 || value > 140) return "warning";
        return "normal";
      case "diastolic":
        if (value < 60 || value > 90) return "warning";
        return "normal";
      case "heartRate":
        if (value < 60 || value > 100) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "danger":
        return "text-red-600 bg-red-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Vital Signs</h1>
            <p className="text-slate-600">Track and monitor your vital signs over time</p>
          </div>
          
          <Dialog open={isAddingVitals} onOpenChange={setIsAddingVitals}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Vital Signs Reading</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolicBP">Systolic Blood Pressure (mmHg)</Label>
                    <Input
                      id="systolicBP"
                      type="number"
                      value={formData.systolicBP}
                      onChange={(e) => setFormData(prev => ({ ...prev, systolicBP: e.target.value }))}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolicBP">Diastolic Blood Pressure (mmHg)</Label>
                    <Input
                      id="diastolicBP"
                      type="number"
                      value={formData.diastolicBP}
                      onChange={(e) => setFormData(prev => ({ ...prev, diastolicBP: e.target.value }))}
                      placeholder="80"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                      placeholder="72"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="98.6"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="165"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="70"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
                  <Input
                    id="bloodSugar"
                    type="number"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodSugar: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddingVitals(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addVitalsMutation.isPending}>
                    {addVitalsMutation.isPending ? "Adding..." : "Add Reading"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addVitalsMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to add vital signs. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Vitals Cards */}
        {latestVitals && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Blood Pressure</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {latestVitals.systolicBP}/{latestVitals.diastolicBP}
                    </p>
                    <p className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(getVitalStatus(latestVitals.systolicBP, "systolic"))}`}>
                      {getVitalStatus(latestVitals.systolicBP, "systolic") === "normal" ? "Normal" : "Needs attention"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Heart Rate</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {latestVitals.heartRate} BPM
                    </p>
                    <p className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(getVitalStatus(latestVitals.heartRate, "heartRate"))}`}>
                      {getVitalStatus(latestVitals.heartRate, "heartRate") === "normal" ? "Normal" : "Needs attention"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="text-red-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Weight</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {latestVitals.weight} lbs
                    </p>
                    <p className="text-sm text-slate-500">
                      {latestVitals.height != null &&
                       latestVitals.height > 0 &&
                       latestVitals.weight != null &&
                       `BMI: ${(
                       (latestVitals.weight / (latestVitals.height * latestVitals.height)) *
                         703
                        ).toFixed(1)}`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Scale className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Temperature</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {latestVitals.temperature ? `${latestVitals.temperature}°F` : "N/A"}
                    </p>
                    <p className="text-sm text-slate-500">Body temperature</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="text-orange-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vitals Chart */}
        <VitalsChart
  vitals={vitals.map((vital) => ({
    ...vital,
    recordedAt: vital.recordedAt
      ? new Date(vital.recordedAt)
      : null,
  }))}
  className="mb-8"
/>

        {/* Recent Readings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {vitals.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Vitals Recorded</h3>
                <p className="text-slate-600 mb-6">Start tracking your vital signs to monitor your health</p>
                <Button onClick={() => setIsAddingVitals(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Reading
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {vitals.slice(0, 10).map((vital: any) => (
                  <div key={vital.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-slate-500">
                        {new Date(vital.recordedAt).toLocaleDateString()} at {new Date(vital.recordedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      {vital.systolicBP && vital.diastolicBP && (
                        <div className="text-center">
                          <p className="font-medium text-slate-900">{vital.systolicBP}/{vital.diastolicBP}</p>
                          <p className="text-slate-500">BP</p>
                        </div>
                      )}
                      {vital.heartRate && (
                        <div className="text-center">
                          <p className="font-medium text-slate-900">{vital.heartRate}</p>
                          <p className="text-slate-500">HR</p>
                        </div>
                      )}
                      {vital.weight && (
                        <div className="text-center">
                          <p className="font-medium text-slate-900">{vital.weight}</p>
                          <p className="text-slate-500">Weight</p>
                        </div>
                      )}
                      {vital.temperature && (
                        <div className="text-center">
                          <p className="font-medium text-slate-900">{vital.temperature}°F</p>
                          <p className="text-slate-500">Temp</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
