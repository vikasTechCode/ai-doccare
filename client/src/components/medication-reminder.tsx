import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillBottle, Check } from "lucide-react";
import { Medication, MedicationLog } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface MedicationReminderProps {
  medications: Medication[];
}

export function MedicationReminder({ medications }: MedicationReminderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  
const { data: logs = [] } = useQuery<MedicationLog[]>({
  queryKey: ["/api/medication-logs", user?.id],
  queryFn: async () => {
    if (!user?.id) return [];

    const response = await apiRequest(
      "GET",
      `/api/medication-logs?userId=${user.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load medication logs");
    }

    return response.json();
  },
  enabled: !!user?.id,
});


  const today = new Date().toDateString();

  const todaysLogs = logs.filter(
    (log) => new Date(log.takenAt).toDateString() === today
  );

  const takenMedicationIds = new Set(
    todaysLogs
      .filter((log) => log.wasTaken)
      .map((log) => log.medicationId)
  );

  const todaysDue = medications.filter(
    (medication) =>
      medication.isActive && !takenMedicationIds.has(medication.id)
  );

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
        queryKey: ["/api/medication-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/medications", user?.id],
      });
    },
  });

  const completedToday = medications.filter(
    (medication) =>
      medication.isActive && takenMedicationIds.has(medication.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Medication Reminders</CardTitle>
          {todaysDue.length > 0 && (
            <Badge variant="destructive">{todaysDue.length} Due</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {todaysDue.length === 0 ? (
          <div className="text-center py-6">
            <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-slate-600">
              All medications up to date!
            </p>
          </div>
        ) : (
          todaysDue.map((medication) => (
            <div
              key={medication.id}
              className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <PillBottle className="text-orange-600 h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {medication.name} {medication.dosage}
                  </p>
                  <p className="text-sm text-slate-600">
                    {medication.frequency}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  logMedicationMutation.mutate(medication.id)
                }
                disabled={logMedicationMutation.isPending}
                className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
              >
                Mark Taken
              </Button>
            </div>
          ))
        )}

        {completedToday.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-700">
              Completed today
            </p>

            {completedToday.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Check className="text-green-600 h-5 w-5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      {medication.name} {medication.dosage}
                    </p>
                    <p className="text-sm text-slate-600">
                      {medication.frequency}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  ✓ Taken
                </span>
              </div>
            ))}
          </div>
        )}

        <Button variant="ghost" className="w-full text-blue-600">
          <PillBottle className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </CardContent>
    </Card>
  );
}