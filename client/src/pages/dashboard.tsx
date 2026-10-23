import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { VitalsChart } from "@/components/vitals-chart";
import { SymptomChecker } from "@/components/symptom-checker";
import { AIHealthAssistant } from "@/components/ai-assistant";
import { MedicationReminder } from "@/components/medication-reminder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Heart, Activity, Calendar, PillBottle, Download, Eye, Upload, FileText, X as XRay, Pill } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";


export default function Dashboard() {
  const { user } = useAuth();

  
const { data: healthScore = 87 } = useQuery<number>({
  queryKey: ["/api/health-score", user?.id],
  enabled: !!user,
});


  
const { data: vitals = [] } = useQuery<any[]>({
  queryKey: [`/api/vitals/${user?.id}`, user?.id],
  enabled: !!user,
});


  
const { data: latestVitals } = useQuery<{
  systolicBP: number | null;
  diastolicBP: number | null;
} | null>({
  queryKey: [`/api/vitals/${user?.id}/latest`, user?.id],
  enabled: !!user,
});


  const { data: appointments = [] } = useQuery<any[]>({
  queryKey: ["/api/appointments", user?.id],
  enabled: !!user,
});

  

const { data: medications = [] } = useQuery<any[]>({
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



  
const { data: medicalRecords = [] } = useQuery<any[]>({
  queryKey: ["/api/medical-records", user?.id],
  enabled: !!user,
});


  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: () => fetch("/api/articles?limit=3").then(res => res.json()),
  });

  const upcomingAppointments = appointments.filter((apt: any) => 
    new Date(apt.appointmentDate) > new Date()
  ).slice(0, 2);

  const activeMedications = medications.filter((med: any) => med.isActive);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Health Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's your health overview for today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Health Score</p>
                  <p className="text-3xl font-bold text-green-600">{healthScore}</p>
                  <p className="text-sm text-green-600">+5 from last week</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Blood Pressure</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {latestVitals ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}` : "N/A"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {latestVitals ? "Latest reading" : "No data"}
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
                  <p className="text-slate-600 text-sm font-medium">Next Appointment</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {upcomingAppointments[0] ? 
                      new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString() 
                      : "None scheduled"
                    }
                  </p>
                  <p className="text-sm text-slate-500">
                    {upcomingAppointments[0] ? upcomingAppointments[0].appointmentType : "Book an appointment"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-orange-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Medications</p>
                  <p className="text-2xl font-bold text-slate-900">{activeMedications.length}</p>
                  <p className="text-sm text-amber-600">
                    {activeMedications.length > 0 ? `${activeMedications.length} active` : "None active"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <PillBottle className="text-amber-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vitals Chart */}
            <VitalsChart vitals={vitals} />

            {/* Symptom Checker */}
            <SymptomChecker />

            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Health Assistant */}
            <AIHealthAssistant />

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <Link href="/appointments">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-slate-600">No upcoming appointments</p>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Calendar className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{appointment.appointmentType}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(appointment.appointmentDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/appointments">
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book New Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medication Reminders */}
            <MedicationReminder medications={activeMedications} />
          </div>
        </div>

        {/* Health Articles */}
        <Card className="mt-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Health Articles & Tips</CardTitle>
              <Link href="/articles">
                <Button variant="ghost">View All Articles</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: any) => (
                <div key={article.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold text-slate-900 mb-2">{article.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{article.readTime}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
