"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Sun, Monitor, LogOut, User, Settings as SettingsIcon, CreditCard, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";

export function Header() {
  const { setTheme, theme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayName = user?.user_metadata?.full_name || (isAdmin ? "Sakarsa Super Admin" : "Freelancer");
  const displayEmail = user?.email || (isAdmin ? "dev@sakarsa.com" : "demo@bidlens.ai");
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      {/* Left - Page context area */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Badge className="bg-neon/15 text-neon border-neon/30 text-[10px] font-bold">
              SUPER ADMIN MODE
            </Badge>
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                {!mounted ? (
                  <Moon className="h-[18px] w-[18px]" />
                ) : theme === "dark" ? (
                  <Moon className="h-[18px] w-[18px]" />
                ) : theme === "light" ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Monitor className="h-[18px] w-[18px]" />
                )}
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="bg-neon/20 text-neon text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {displayName}
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isAdmin ? (
              <Link href="/admin">
                <DropdownMenuItem className="cursor-pointer text-neon focus:text-neon">
                  <Shield className="mr-2 h-4 w-4 text-neon" />
                  Admin Command Center
                </DropdownMenuItem>
              </Link>
            ) : (
              <>
                <Link href="/profiles">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profiles
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/billing">
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Quota
                  </DropdownMenuItem>
                </Link>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
