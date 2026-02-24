"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Building2,
  Users,
  Wrench,
  Wallet,
  LogOut,
  ChevronRight,
  User,
  Bell,
  Search,
  Receipt,
  ChevronDown,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "../../app/ThemeToggle";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const convexUser = useQuery(api.users.getByClerkId, user ? { clerkUserId: user.id } : "skip");

  const pendingSubmissions = useQuery(
    api.paymentSubmissions.getPendingSubmissions,
    convexUser?.isLandlord ? { landlordId: convexUser._id } : "skip"
  );

  const pendingCount = pendingSubmissions?.length || 0;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0F]">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-white dark:bg-[#1F1F27] border-r border-slate-200 dark:border-white/10 flex flex-col fixed left-0 top-0 bottom-0 z-30">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#c9a634] flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Unit<span className="text-[#D4AF37]">Sync</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Property Hub
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem
            href="/dashboard"
            icon={Home}
            label="Dashboard"
            isActive={pathname === "/dashboard"}
          />
          <NavItem
            href="/dashboard/properties"
            icon={Building2}
            label="Properties"
            isActive={pathname?.startsWith("/dashboard/properties")}
          />
          <NavItem
            href="/dashboard/tenants"
            icon={Users}
            label="Tenants"
            isActive={pathname?.startsWith("/dashboard/tenants")}
          />
          <NavItem
            href="/dashboard/rents"
            icon={Wallet}
            label="Payments"
            isActive={pathname?.startsWith("/dashboard/rents")}
          />
          <NavItem
            href="/dashboard/payment-submission"
            icon={Receipt}
            label="Submissions"
            isActive={pathname?.startsWith("/dashboard/payment-submissions")}
            badge={pendingCount > 0 ? pendingCount : null}
          />
          <NavItem
            href="/dashboard/maintenance"
            icon={Wrench}
            label="Maintenance"
            isActive={pathname?.startsWith("/dashboard/maintenance")}
          />
        </nav>

        {/* User Profile - Sticky at bottom */}
        <div className="mt-auto border-t border-slate-200 dark:border-white/10 p-3">
          <SignOutButton>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all group">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area - With left margin for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        {/* Top Navigation Bar - Sticky */}
        <header className="h-16 bg-white dark:bg-[#1F1F27] border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-[#1F1F27]/80">
          <div className="flex items-center gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Dashboard</span>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-medium capitalize">
                    {pathname?.split("/").pop()?.replace("-", " ")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right side - User profile */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 w-9 h-9"
            >
              <Search size={18} />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 relative w-9 h-9"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            <ThemeToggle />

            {/* User Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#c9a634] flex items-center justify-center overflow-hidden">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.fullName || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {convexUser?.isAdmin ? "Admin" : "Landlord"}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1F1F27] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {user.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={16} />
                          Profile Settings
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} />
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-200 dark:border-white/10 py-2">
                        <SignOutButton>
                          <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full">
                            <LogOut size={16} />
                            Logout
                          </button>
                        </SignOutButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, isActive, badge }) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
        ${isActive
          ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold dark:bg-[#D4AF37]/20"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#D4AF37]"
        }
      `}
    >
      <Icon
        size={18}
        className={`transition-transform group-hover:scale-110 flex-shrink-0 ${isActive ? "text-[#D4AF37]" : ""
          }`}
      />
      <span className="font-medium text-sm">{label}</span>
      {badge !== null && badge > 0 && (
        <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {isActive && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
      )}
    </Link>
  );
}