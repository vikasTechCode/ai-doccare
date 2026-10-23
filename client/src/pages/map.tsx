
import { Navigation } from "@/components/navigation";
import { HealthcareMap } from "@/components/healthcare-map";
import { Card, CardContent } from "@/components/ui/card";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Nearby Hospitals & Clinics
          </h1>

          <p className="text-slate-600">
            Find nearby hospitals and clinics, search by area, and get directions.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <HealthcareMap />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
