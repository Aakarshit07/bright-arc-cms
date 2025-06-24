"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlogForm } from "@/components/forms/blog-form";
import { useBlogStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Blog, BlogFormData } from "@/lib/types";

export default function CreateEditBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const isEditing = !!editSlug;

  const { createBlog, updateBlog, getBlogBySlug, isLoading } = useBlogStore();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(isEditing);

  // Load blog data if editing
  useEffect(() => {
    const fetchBlog = async () => {
      if (editSlug) {
        setLoading(true);
        try {
          const blogData = await getBlogBySlug(editSlug);
          setBlog(blogData);
        } catch (error) {
          console.error("Error fetching blog:", error);
          toast({
            title: "Error",
            description: "Failed to load blog for editing",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBlog();
  }, [editSlug, getBlogBySlug, toast]);

  const handleSubmit = async (data: BlogFormData) => {
    try {
      let success = false;

      if (isEditing && editSlug) {
        success = await updateBlog(editSlug, data);
      } else {
        success = await createBlog(data);
      }

      if (success) {
        toast({
          title: isEditing ? "Blog updated!" : "Blog created!",
          description: isEditing
            ? "Your changes have been saved."
            : "Your blog has been published.",
        });
        router.push("/dashboard/blogs");
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? "update" : "create"} blog`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting blog:", error);
      toast({
        title: "Unexpected error",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NOTE: should take a full height of page */}
      <div className="flex items-center justify-between space-x-4">
        <Link href="/dashboard/blogs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Blog" : "Create New Blog"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your blog post"
              : "Write and publish a new blog post"}
          </p>
        </div>
      </div>
      {/* NOTE: should take a full height of the parent as when user enter image url it simply overflowing the card  */}
      <Card className="">
        <CardHeader className="pb-">
          <CardTitle>
            {isEditing ? `Edit "${blog?.title || "Blog"}"` : "Blog Details"}
          </CardTitle>
          <CardDescription>
            Fill in the information below to {isEditing ? "update" : "create"}{" "}
            your blog post. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-120px)] pb-6">
          <BlogForm
            blog={blog || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
