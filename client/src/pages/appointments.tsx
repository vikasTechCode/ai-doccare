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
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Calendar, Clock, User, MapPin, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function Appointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "",
    notes: "",
  });

  
const { data: appointments = [], isLoading, error } = useQuery({
  queryKey: ["/api/appointments", user?.id],
  enabled: !!user?.id,
  queryFn: async () => {
    const response = await fetch(`/api/appointments/${user!.id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    return response.json();
  },
});


  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const dateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
      const response = await apiRequest("POST", "/api/appointments", {
        patientId: user?.id,
        doctorId: parseInt(appointmentData.doctorId),
        appointmentDate: dateTime,
        appointmentType: appointmentData.appointmentType,
        notes: appointmentData.notes,
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", user?.id] });
      setIsBooking(false);
      setFormData({
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        appointmentType: "",
        notes: "",
      });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        status: "cancelled",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", user?.id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointmentMutation.mutate(formData);
  };

  
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "scheduled":
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };


  
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "scheduled":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-600" />;
    }
  };


  const upcomingAppointments = appointments.filter(
  (apt: any) =>
    new Date(apt.appointmentDate) > new Date() &&
    ["pending", "confirmed", "scheduled"].includes(
      apt.status?.toLowerCase()
    )
);

  const pastAppointments = appointments.filter(
  (apt: any) =>
    new Date(apt.appointmentDate) <= new Date() ||
    ["rejected", "cancelled", "completed"].includes(
      apt.status?.toLowerCase()
    )
);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Appointments</h1>
            <p className="text-slate-600">Manage your healthcare appointments</p>
          </div>
          
          <Dialog open={isBooking} onOpenChange={setIsBooking}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">Doctor</Label>
                    <Select
                      onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
  <SelectItem value="2">Dr. Sarah Smith - Cardiology</SelectItem>
  <SelectItem value="5">Dr. Michael Chen - General Practice</SelectItem>
  <SelectItem value="6">Dr. Lisa Johnson - Dermatology</SelectItem>
  <SelectItem value="7">Dr. Robert Kim - Orthopedics</SelectItem>
</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select
                      onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="checkup">Regular Checkup</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="specialist">Specialist Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific concerns or information for the doctor"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsBooking(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={bookAppointmentMutation.isPending}>
                    {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {bookAppointmentMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to book appointment. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Upcoming Appointments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Upcoming Appointments</h3>
                <p className="text-slate-600 mb-6">Schedule your next healthcare visit</p>
                <Button onClick={() => setIsBooking(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{appointment.appointmentType}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleTimeString()}
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-slate-600 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(appointment.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                        disabled={cancelAppointmentMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
          </CardHeader>
          <CardContent>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-600">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{appointment.appointmentType}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleTimeString()}
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-slate-600 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(appointment.status)}
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
