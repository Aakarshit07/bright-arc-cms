"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommentStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Check, X, MessageSquare } from "lucide-react";
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
import { BlogsByCategory } from "@/components/blogs-by-category";
import type { Blog } from "@/lib/types";

export default function CommentsPage() {
  const { comments, isLoading, fetchComments, updateCommentStatus } =
    useCommentStore();
  const { toast } = useToast();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (selectedBlog) {
      fetchComments(selectedBlog.slug);
    }
  }, [selectedBlog, fetchComments]);

  const handleBlogSelect = (blog: Blog) => {
    setSelectedBlog(blog);
  };

  const handleStatusUpdate = async (
    commentId: string,
    status: "approved" | "rejected"
  ) => {
    if (!selectedBlog) return;

    const success = await updateCommentStatus(
      selectedBlog.slug,
      commentId,
      status
    );

    if (success) {
      toast({
        title: "Comment updated",
        description: `Comment has been ${status}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update comment status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Sort comments by date (newest first) and prioritize pending comments
  const sortedComments = comments.sort((a, b) => {
    // First, prioritize pending comments
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;

    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Moderate and manage blog comments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - Blogs by Category using Tabs */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Blogs by Category
            </CardTitle>
            <CardDescription>
              Select a blog to view and moderate its comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlogsByCategory
              onBlogSelect={handleBlogSelect}
              selectedBlogSlug={selectedBlog?.slug}
              showCommentCount={true}
              cardSize="sm"
              variant="list"
            />
          </CardContent>
        </Card>

        {/* Right Column - Comments */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              {selectedBlog
                ? `Comments for "${selectedBlog.title}"`
                : "Select a blog to view comments"}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {!selectedBlog ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a blog</h3>
                <p className="text-muted-foreground">
                  Choose a blog from the left to view its comments
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  This blog post doesn't have any comments yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Use sorted comments */}
                {sortedComments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{comment.user}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(comment.date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>

                    <p className="text-sm bg-muted p-3 rounded-md">
                      {comment.text}
                    </p>

                    {comment.status === "pending" && (
                      <div className="flex items-center space-x-2">
                        {/* Approve Button with Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="mr-2 h-3 w-3" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Approve Comment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this comment
                                from {comment.user}? {"  "}
                                <span className="text-black font-mono">
                                  "{comment.text}"
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleStatusUpdate(comment._id, "approved")
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve Comment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Reject Button with Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="mr-2 h-3 w-3" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Reject Comment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this comment
                                from {comment.user}?{"  "}
                                <span className="text-black font-mono">
                                  "{comment.text}"
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleStatusUpdate(comment._id, "rejected")
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject Comment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
