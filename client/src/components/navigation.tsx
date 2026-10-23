import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
  href={user.role === "admin" ? "/admin" : "/dashboard"}
  className="flex items-center space-x-2"
>
                <Heart className="text-blue-600 h-8 w-8" />
                <span className="text-xl font-bold text-slate-900">AI DocCare</span>
              </Link>
              
<div className="hidden md:flex space-x-6">
  <Link
    href={
  user.role === "admin"
    ? "/admin"
    : user.role === "doctor"
      ? "/doctor"
      : "/dashboard"
}
    className={`font-medium pb-1 transition-colors ${
      isActive(
  user.role === "admin"
    ? "/admin"
    : user.role === "doctor"
      ? "/doctor"
      : "/dashboard"
)
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-slate-600 hover:text-blue-600"
    }`}
  >
    Dashboard
  </Link>

    {user.role === "patient" && (
    <>
      <Link
        href="/medical-records"
        className={`font-medium pb-1 transition-colors ${
          isActive("/medical-records")
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`}
      >
        Medical Records
      </Link>

      <Link
        href="/vitals"
        className={`font-medium pb-1 transition-colors ${
          isActive("/vitals")
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`}
      >
        Vitals
      </Link>

      <Link
        href="/appointments"
        className={`font-medium pb-1 transition-colors ${
          isActive("/appointments")
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`}
      >
        Appointments
      </Link>

      <Link
        href="/map"
        className={`font-medium pb-1 transition-colors ${
          isActive("/map")
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`}
      >
        Map
      </Link>

      <Link
        href="/medications"
        className={`font-medium pb-1 transition-colors ${
          isActive("/medications")
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`}
      >
        Medications
      </Link>
      
<Link
  href="/emergency-contacts"
  className={`font-medium pb-1 transition-colors ${
    isActive("/emergency-contacts")
      ? "text-red-600 border-b-2 border-red-600"
      : "text-slate-600 hover:text-red-600"
  }`}
>
  🚨 Emergency
</Link>

<Link
  href="/faqs"
  className={`font-medium pb-1 transition-colors ${
    isActive("/faqs")
      ? "text-blue-600 border-b-2 border-blue-600"
      : "text-slate-600 hover:text-blue-600"
  }`}
>
  FAQs
</Link>

    </>
  )}
</div>

            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-700 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/articles">Health Articles</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      
      {/* Mobile Navigation */}
      {user.role === "doctor" ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/doctor"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive("/doctor") ? "text-blue-600" : "text-slate-600"
              }`}
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">Doctor Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
          <div className={`grid ${user.role === "admin" ? "grid-cols-2" : "grid-cols-6"} gap-1`}>
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              className={`flex flex-col items-center py-2 px-1 ${
                isActive(user.role === "admin" ? "/admin" : "/dashboard")
                  ? "text-blue-600"
                  : "text-slate-600"
              }`}
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Link>

            {user.role !== "admin" && (
              <>
                <Link href="/vitals" className={`flex flex-col items-center py-2 px-1 ${isActive("/vitals") ? "text-blue-600" : "text-slate-600"}`}>
                  <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs">Vitals</span>
                </Link>

                <Link href="/appointments" className={`flex flex-col items-center py-2 px-1 ${isActive("/appointments") ? "text-blue-600" : "text-slate-600"}`}>
                  <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Appointments</span>
                </Link>

                <Link href="/map" className={`flex flex-col items-center py-2 px-1 ${isActive("/map") ? "text-blue-600" : "text-slate-600"}`}>
                  <span className="text-xl mb-1">📍</span>
                  <span className="text-xs">Map</span>
                </Link>

                <Link href="/medications" className={`flex flex-col items-center py-2 px-1 ${isActive("/medications") ? "text-blue-600" : "text-slate-600"}`}>
                  <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a6 6 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A6 6 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-xs">Medications</span>
                </Link>

                <Link href="/profile" className={`flex flex-col items-center py-2 px-1 ${isActive("/profile") ? "text-blue-600" : "text-slate-600"}`}>
                  <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>  
                  <span className="text-xs">Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

    </>
  );
}
