"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your CMS configuration and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <p className="text-sm text-muted-foreground">
                {session?.user?.username || "admin"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <p className="text-sm text-green-600">Active</p>
            </div>
            <div>
              <label className="text-sm font-medium">Session ID</label>
              <p className="text-sm text-muted-foreground font-mono">
                {session?.user?.id?.slice(0, 8) || "N/A"}...
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Authentication Method
              </label>
              <p className="text-sm text-muted-foreground">
                NextAuth.js with Credentials
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Backend Integration</label>
              <p className="text-sm text-muted-foreground">
                Express.js with MongoDB
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Session Duration</label>
              <p className="text-sm text-muted-foreground">24 hours</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change Password (Contact Developer)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database connection and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Database Type</label>
              <p className="text-sm text-muted-foreground">MongoDB Atlas</p>
            </div>
            <div>
              <label className="text-sm font-medium">Backend URL</label>
              <p className="text-sm text-muted-foreground">
                http://localhost:5000
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Categories</label>
              <p className="text-sm text-muted-foreground">
                10 configured categories
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Current API endpoints and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Authentication</label>
              <p className="text-sm text-green-600">
                ✓ Connected to Express Backend
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Blog API</label>
              <p className="text-sm text-muted-foreground">
                Direct backend integration
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Session Management</label>
              <p className="text-sm text-green-600">✓ NextAuth.js Active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
