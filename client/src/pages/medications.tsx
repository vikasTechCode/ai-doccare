import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, PillBottle, Clock, Calendar, AlertCircle, Check, X } from "lucide-react";

export default function Medications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    instructions: "",
  });

 

const { data: medications = [] } = useQuery({
  queryKey: ["/api/medications", user?.id],
  queryFn: async () => {
    if (!user?.id) return [];

    const response = await apiRequest(
      "GET",
      `/api/medications?userId=${user.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load medications");
    }

    return response.json();
  },
  enabled: !!user?.id,
});



  const addMedicationMutation = useMutation({
    mutationFn: async (medicationData: any) => {
      const response = await apiRequest("POST", "/api/medications", {
        ...medicationData,
        userId: user?.id,
        startDate: new Date(medicationData.startDate).toISOString(),
        endDate: medicationData.endDate ? new Date(medicationData.endDate).toISOString() : null,
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", user?.id] });
      setIsAddingMedication(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        instructions: "",
      });
    },
  });

  const toggleMedicationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/medications/${id}`, {
        isActive,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", user?.id] });
    },
  });

  
const logMedicationMutation = useMutation({
  mutationFn: async (medicationId: number) => {
    const response = await apiRequest("POST", "/api/medication-logs", {
      medicationId,
      takenAt: new Date().toISOString(),
      wasTaken: true,
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/medications", user?.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["/api/medication-logs", user?.id],
    });
  },
});


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicationMutation.mutate(formData);
  };

  const activeMedications = medications.filter((med: any) => med.isActive);
  const inactiveMedications = medications.filter((med: any) => !med.isActive);

  const getFrequencyDisplay = (frequency: string) => {
    const frequencyMap: { [key: string]: string } = {
      "once_daily": "Once daily",
      "twice_daily": "Twice daily",
      "three_times_daily": "Three times daily",
      "four_times_daily": "Four times daily",
      "as_needed": "As needed",
      "weekly": "Weekly",
      "monthly": "Monthly",
    };
    return frequencyMap[frequency] || frequency;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Medications</h1>
            <p className="text-slate-600">Manage your medication schedule and track adherence</p>
          </div>
          
          <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medication Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lisinopril"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_daily">Once daily</SelectItem>
                      <SelectItem value="twice_daily">Twice daily</SelectItem>
                      <SelectItem value="three_times_daily">Three times daily</SelectItem>
                      <SelectItem value="four_times_daily">Four times daily</SelectItem>
                      <SelectItem value="as_needed">As needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="e.g., Take with food, avoid alcohol"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddingMedication(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMedicationMutation.isPending}>
                    {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addMedicationMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to add medication. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Medications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Today's Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMedications.length === 0 ? (
              <div className="text-center py-8">
                <PillBottle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Medications</h3>
                <p className="text-slate-600 mb-6">Add your medications to start tracking</p>
                <Button onClick={() => setIsAddingMedication(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Medication
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMedications.map((medication: any) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <PillBottle className="text-orange-600 h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {medication.name} {medication.dosage}
                        </h3>
                        <p className="text-sm text-slate-600">{getFrequencyDisplay(medication.frequency)}</p>
                        {medication.instructions && (
                          <p className="text-sm text-slate-500 mt-1">{medication.instructions}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {medication.endDate ? 
                          `Until ${new Date(medication.endDate).toLocaleDateString()}` : 
                          "Ongoing"
                        }
                      </Badge>
                      
<Button
  size="sm"
  variant="outline"
  onClick={() => logMedicationMutation.mutate(medication.id)}
  disabled={logMedicationMutation.isPending}
  className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
>
  {logMedicationMutation.isPending ? "Saving..." : "Mark Taken"}
</Button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Medications */}
        <Card>
          <CardHeader>
            <CardTitle>All Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Active Medications */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Medications</h3>
                <div className="space-y-3">
                  {activeMedications.map((medication: any) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <PillBottle className="text-green-600 h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">
                            {medication.name} {medication.dosage}
                          </h4>
                          <p className="text-sm text-slate-600">{getFrequencyDisplay(medication.frequency)}</p>
                          <p className="text-sm text-slate-500">
                            Started: {new Date(medication.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`active-${medication.id}`} className="text-sm">Active</Label>
                          <Switch
                            id={`active-${medication.id}`}
                            checked={medication.isActive}
                            onCheckedChange={(checked) => 
                              toggleMedicationMutation.mutate({ id: medication.id, isActive: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inactive Medications */}
              {inactiveMedications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Inactive Medications</h3>
                  <div className="space-y-3">
                    {inactiveMedications.map((medication: any) => (
                      <div key={medication.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <PillBottle className="text-slate-500 h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700">
                              {medication.name} {medication.dosage}
                            </h4>
                            <p className="text-sm text-slate-500">{getFrequencyDisplay(medication.frequency)}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(medication.startDate).toLocaleDateString()} - 
                              {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "Stopped"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">Inactive</Badge>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`active-${medication.id}`} className="text-sm">Active</Label>
                            <Switch
                              id={`active-${medication.id}`}
                              checked={medication.isActive}
                              onCheckedChange={(checked) => 
                                toggleMedicationMutation.mutate({ id: medication.id, isActive: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
