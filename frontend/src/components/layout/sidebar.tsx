"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Briefcase,
  BookOpen,
  UserCircle,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

// Standard Freelancer Navigation Items
const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs/new", label: "New Proposal", icon: PenSquare },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/profiles", label: "Profiles", icon: UserCircle },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Super Admin Navigation Items (Only Admin Oversight Tools)
const adminNavItems = [
  { href: "/admin", label: "Admin Command Center", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin } = useAuth();

  const displayName = user?.user_metadata?.full_name || (isAdmin ? "Sakarsa Super Admin" : "Freelancer");
  const displayEmail = user?.email || (isAdmin ? "dev@sakarsa.com" : "user@bidlens.ai");
  const initials = displayName.slice(0, 2).toUpperCase();

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-border/60 bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/50 px-3.5">
        <BrandLogo
          size="sm"
          showText={!collapsed}
          badge={isAdmin ? "ADMIN" : undefined}
          badgeClassName="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[9px] font-bold px-1.5 py-0"
          href={isAdmin ? "/admin" : "/dashboard"}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          let isActive = false;
          if (item.href === "/dashboard") {
            isActive = pathname === "/dashboard";
          } else if (item.href === "/admin") {
            isActive = pathname === "/admin";
          } else if (item.href === "/jobs") {
            isActive = pathname === "/jobs" || (pathname.startsWith("/jobs/") && pathname !== "/jobs/new");
          } else if (item.href === "/jobs/new") {
            isActive = pathname === "/jobs/new";
          } else {
            isActive = pathname.startsWith(item.href);
          }

          const linkEl = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30 font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.href === "/jobs/new" && (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-primary/15 text-primary text-[10px] px-1.5 py-0 h-5"
                >
                  AI
                </Badge>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={linkEl} />
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={item.href}>{linkEl}</React.Fragment>;
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t border-border/50 p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 border border-border/60">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </p>
              {isAdmin && (
                <p className="text-[10px] text-primary font-mono mt-0.5 font-semibold">
                  Super Admin
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
