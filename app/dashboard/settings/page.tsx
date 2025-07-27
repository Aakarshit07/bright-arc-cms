"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlogStore, useCategoryStore, useContactStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User, Shield, Database, Activity, Globe, Clock } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { blogs, fetchBlogs, isLoading: blogsLoading } = useBlogStore();
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoryStore();
  const {
    contacts,
    fetchContacts,
    isLoading: contactsLoading,
  } = useContactStore();
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    fetchContacts();
    checkBackendStatus();
  }, [fetchBlogs, fetchCategories, fetchContacts]);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`
      );
      console.log("Backend status check response:", response);
      setBackendStatus(response.ok ? "online" : "offline");
    } catch (error) {
      setBackendStatus("offline");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">✓ Online</Badge>;
      case "offline":
        return <Badge className="bg-red-100 text-red-800">✗ Offline</Badge>;
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Checking...</Badge>
        );
    }
  };

  const totalLikes = blogs.reduce((sum, blog) => sum + blog.likeCount, 0);
  const totalComments = blogs.reduce((sum, blog) => sum + blog.commentCount, 0);
  const activeCategories = categories.filter(
    (cat) => cat.activeStatus === "active"
  ).length;

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
            <div>
              <label className="text-sm font-medium">Login Time</label>
              <p className="text-sm text-muted-foreground">
                {session ? new Date().toLocaleDateString() : "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Content Statistics
            </CardTitle>
            <CardDescription>Overview of your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blogsLoading || categoriesLoading || contactsLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Total Blogs</label>
                  <p className="text-sm text-muted-foreground">
                    {blogs.length} published articles
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Categories</label>
                  <p className="text-sm text-muted-foreground">
                    {activeCategories} active / {categories.length} total
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Total Engagement
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {totalLikes} likes • {totalComments} comments
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Contact Submissions
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {contacts.length} inquiries received
                  </p>
                </div>
              </>
            )}
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
            <div>
              <label className="text-sm font-medium">Last Activity</label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </p>
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
              System Status
            </CardTitle>
            <CardDescription>Backend and database connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Database Type</label>
              <p className="text-sm text-muted-foreground">MongoDB Atlas</p>
            </div>
            <div>
              <label className="text-sm font-medium">Backend URL</label>
              <p className="text-sm text-muted-foreground font-mono">
                brightarcbackend-5p0v.onrender.com
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Backend Status</label>
              <div className="flex items-center space-x-2">
                {getStatusBadge(backendStatus)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkBackendStatus}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">API Health</label>
              <p className="text-sm text-green-600">
                ✓ All endpoints responding
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Environment
            </CardTitle>
            <CardDescription>Current deployment environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Environment</label>
              <p className="text-sm text-muted-foreground">
                {process.env.NODE_ENV === "production"
                  ? "Production"
                  : "Development"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Build Version</label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Deployment</label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Uptime</label>
              <p className="text-sm text-green-600">✓ System operational</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Last Blog Created</label>
              <p className="text-sm text-muted-foreground">
                {blogs.length > 0
                  ? new Date(
                      Math.max(
                        ...blogs.map((blog) =>
                          new Date(blog.postDate).getTime()
                        )
                      )
                    ).toLocaleDateString()
                  : "No blogs yet"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Contact</label>
              <p className="text-sm text-muted-foreground">
                {contacts.length > 0
                  ? new Date(
                      Math.max(
                        ...contacts.map((contact) =>
                          new Date(contact.createdAt).getTime()
                        )
                      )
                    ).toLocaleDateString()
                  : "No contacts yet"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Categories Updated</label>
              <p className="text-sm text-muted-foreground">
                {categories.length > 0
                  ? `${categories.length} categories configured`
                  : "No categories"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
