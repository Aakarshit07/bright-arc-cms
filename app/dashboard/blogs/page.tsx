"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlogStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  MessageSquare,
  FileText,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BlogsPage() {
  const { blogs, isLoading, fetchBlogs, deleteBlog } = useBlogStore();
  const { toast } = useToast();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    const success = await deleteBlog(slug);

    if (success) {
      toast({
        title: "Blog deleted",
        description: "The blog has been successfully deleted",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the blog",
        variant: "destructive",
      });
    }
    setDeletingSlug(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and articles
          </p>
        </div>
        <Link href="/dashboard/blogs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Blog
          </Button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first blog post
            </p>
            <Link href="/dashboard/blogs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="line-clamp-1">{blog.title}</CardTitle>
                    <CardDescription>
                      By {blog.author} •{" "}
                      {new Date(blog.postDate).toLocaleDateString()}
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {blog.likeCount}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {blog.commentCount}
                      </div>
                    </div>
                  </div>
                  {/* Display capitalized category name for UI */}
                  <Badge variant="secondary">
                    {blog.category.categoryName.charAt(0).toUpperCase() +
                      blog.category.categoryName.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="text-muted-foreground line-clamp-2 mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
                <div className="flex items-center space-x-2">
                  {/* Edit Button - Uses query parameter */}
                  <Link href={`/dashboard/blogs/create?edit=${blog.slug}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the blog post "{blog.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(blog.slug)}
                          disabled={deletingSlug === blog.slug}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingSlug === blog.slug && (
                            <LoadingSpinner size="sm" className="mr-2" />
                          )}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
