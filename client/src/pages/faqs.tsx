
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const questions = [
  {
    question: "What is AI DocCare?",
    answer:
      "AI DocCare is a healthcare application that helps users access their health dashboard, medical records, vitals, appointments and medication information.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Open the Appointments section and follow the available booking options. Check the appointment details before submitting.",
  },
  {
    question: "Where can I view my medical records?",
    answer:
      "Open Medical Records from the navigation menu to access the records available to your account.",
  },
  {
    question: "How can I check my vitals?",
    answer:
      "Open the Vitals section to view the health measurements available in your account.",
  },
  {
    question: "Where can I find emergency numbers?",
    answer:
      "Open Emergency Contacts in the navigation menu. In India, call 112 for urgent emergency assistance.",
  },
  {
    question: "Can I use AI DocCare instead of a doctor?",
    answer:
      "No. The application provides health information and support, but it does not replace professional medical advice, diagnosis or treatment.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "Use the password recovery option if your application provides one. Otherwise, contact the system administrator for assistance.",
  },
  {
    question: "Who can access my health information?",
    answer:
      "Access depends on the application's authentication and permissions. Avoid sharing your password, and only use accounts you are authorized to access.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-slate-600">
            Find answers to common questions about AI DocCare.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How can we help you?</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {questions.map((item, index) => (
              <div
                key={item.question}
                className="rounded-lg border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium text-slate-800 hover:text-blue-600"
                  aria-expanded={openIndex === index}
                >
                  {item.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
