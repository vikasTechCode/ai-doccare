
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  CalendarDays,
} from "lucide-react";

type Appointment = {
  id: number;
  patientName?: string;
  appointmentDate?: string;
  appointmentType?: string;
  status?: string;
  notes?: string | null;
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Build the doctor's name without displaying "Dr." twice.
  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/^dr\.?\s*/i, "")
    .trim();

  const doctorName = fullName || user?.username || "Doctor";

  const appointmentsQueryKey = [
    "/api/doctor/appointments",
    user?.id,
  ];

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery<Appointment[]>({
    queryKey: appointmentsQueryKey,
    enabled: !!user && user.role === "doctor",

    queryFn: async () => {
      const response = await fetch(
        `/api/doctor/appointments?doctorId=${user!.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "You are not authorized to view these appointments."
            : "Failed to load doctor appointments."
        );
      }

      return response.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "confirmed" | "rejected";
    }) => {
      const response = await fetch(
        `/api/doctor/appointments/${id}/status?doctorId=${user!.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.message || "Failed to update appointment."
        );
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/api/doctor/appointments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["/api/admin/appointments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["/api/appointments"],
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome, Dr. {doctorName}. Manage your assigned appointments here.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              My Appointments
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading && (
              <p>Loading appointments...</p>
            )}

            {isError && (
              <p className="text-red-600">
                {error instanceof Error
                  ? error.message
                  : "Could not load appointments. Please try again."}
              </p>
            )}

            {!isLoading && !isError && appointments.length === 0 && (
              <p className="text-slate-500">
                You have no assigned appointments yet.
              </p>
            )}

            {!isError && (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        Appointment #{appointment.id}
                      </p>

                      <p className="text-sm text-slate-600">
                        Patient: {appointment.patientName || "Unknown patient"}
                      </p>

                      <p className="text-sm text-slate-600">
                        {appointment.appointmentDate
                          ? new Date(
                              appointment.appointmentDate
                            ).toLocaleString()
                          : "Date not available"}
                      </p>

                      <p className="mt-1 text-sm">
                        Type: {appointment.appointmentType || "General"}
                      </p>

                      <p className="text-sm">
                        Status: {appointment.status || "Unknown"}
                      </p>

                      {appointment.notes && (
                        <p className="mt-1 text-sm text-slate-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>

                    {["pending", "scheduled"].includes(
                      appointment.status?.toLowerCase() || ""
                    ) && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: appointment.id,
                              status: "confirmed",
                            })
                          }
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Accept
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: appointment.id,
                              status: "rejected",
                            })
                          }
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {statusMutation.isError && (
              <p className="mt-4 text-sm text-red-600">
                {statusMutation.error instanceof Error
                  ? statusMutation.error.message
                  : "Could not update the appointment status."}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
