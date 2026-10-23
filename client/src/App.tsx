import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import MedicalRecords from "@/pages/medical-records";
import Vitals from "@/pages/vitals";
import Appointments from "@/pages/appointments";
import Medications from "@/pages/medications";
import Articles from "@/pages/articles";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

import MapPage from "@/pages/map";
import EmergencyContacts from "@/pages/emergency-contacts";
import FAQs from "@/pages/faqs";
import DoctorDashboard from "@/pages/doctor-dashboard";


function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user.role !== 'admin') {
    return <NotFound />;
  }
  
  return <Component />;
}

function DoctorRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  if (user.role !== "doctor") {
    return <NotFound />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/medical-records" component={() => <ProtectedRoute component={MedicalRecords} />} />
      <Route path="/vitals" component={() => <ProtectedRoute component={Vitals} />} />
      <Route path="/appointments" component={() => <ProtectedRoute component={Appointments} />} />
      <Route path="/map" component={() => <ProtectedRoute component={MapPage} />} />
      <Route path="/medications" component={() => <ProtectedRoute component={Medications} />} />
      <Route path="/articles" component={() => <ProtectedRoute component={Articles} />} />
      <Route
  path="/emergency-contacts"
  component={() => <ProtectedRoute component={EmergencyContacts} />}
/>
<Route
  path="/faqs"
  component={() => <ProtectedRoute component={FAQs} />}
/>
<Route
  path="/doctor"
  component={() => (
    <DoctorRoute component={DoctorDashboard} />
  )}
/>
      <Route path="/admin" component={() => <AdminRoute component={Admin} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
