
import { Phone, HeartPulse, ShieldAlert, Brain, Ambulance } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const emergencyContacts = [
  {
    title: "Emergency Services",
    number: "112",
    description: "Police, fire and other emergency assistance across India.",
    icon: ShieldAlert,
  },
  {
    title: "Ambulance",
    number: "108",
    description: "Emergency medical ambulance service in Maharashtra.",
    icon: Ambulance,
  },
  {
    title: "Health Advice",
    number: "104",
    description: "Health advice, blood availability and health-related support in Maharashtra.",
    icon: HeartPulse,
  },
  {
    title: "Mental Health Support",
    number: "14416",
    description: "Tele-MANAS mental health support helpline.",
    icon: Brain,
  },
  {
    title: "Ambulance Transport",
    number: "102",
    description: "Listed for eligible referral transport services. Maharashtra's service availability has regional limitations, including Mumbai.",
    icon: Ambulance,
  },
];

export default function EmergencyContacts() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-red-600 px-6 py-10 text-center text-white">
          <Phone className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-3xl font-bold">Emergency Contacts</h1>
          <p className="mt-3 text-red-100">
            Important emergency and health helpline numbers
          </p>
          <p className="mt-4 text-sm font-semibold">
            If you are facing an emergency, call 112.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;

            return (
              <Card key={contact.number} className="border-0 shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{contact.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {contact.number}
                  </p>

                  <p className="mt-3 min-h-16 text-sm text-slate-600">
                    {contact.description}
                  </p>

                  <Button asChild className="mt-4 w-full bg-red-600 hover:bg-red-700">
                    <a href={`tel:${contact.number}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call {contact.number}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Emergency numbers and availability can vary by service and location.
          Use official government helplines for the latest information.
        </p>
      </div>
    </div>
  );
}
