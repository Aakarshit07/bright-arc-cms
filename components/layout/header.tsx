"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Content Management System</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {session?.user?.username?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {session?.user?.username || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
