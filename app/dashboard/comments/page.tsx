"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCommentStore, useBlogStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Check, X } from "lucide-react"
import { MessageSquare } from "lucide-react" // Import MessageSquare here

export default function CommentsPage() {
  const { comments, isLoading, fetchComments, updateCommentStatus } = useCommentStore()
  const { blogs, fetchBlogs } = useBlogStore()
  const { toast } = useToast()
  const [selectedBlog, setSelectedBlog] = useState<string>("")

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  useEffect(() => {
    if (selectedBlog) {
      fetchComments(selectedBlog)
    }
  }, [selectedBlog, fetchComments])

  const handleStatusUpdate = async (commentId: string, status: "approved" | "rejected") => {
    if (!selectedBlog) return

    const success = await updateCommentStatus(selectedBlog, commentId, status)

    if (success) {
      toast({
        title: "Comment updated",
        description: `Comment has been ${status}`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update comment status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">Moderate and manage blog comments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Blog</CardTitle>
          <CardDescription>Choose a blog to view and moderate its comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Button
                key={blog._id}
                variant={selectedBlog === blog.slug ? "default" : "outline"}
                className="justify-start h-auto p-3"
                onClick={() => setSelectedBlog(blog.slug)}
              >
                <div className="text-left">
                  <div className="font-medium truncate">{blog.title}</div>
                  <div className="text-sm text-muted-foreground">{blog.commentCount} comments</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBlog && (
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Comments for the selected blog post</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">This blog post doesn't have any comments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{comment.user}</h4>
                        <p className="text-sm text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</p>
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>

                    <p className="text-sm mb-4">{comment.text}</p>

                    {comment.status === "pending" && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(comment._id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(comment._id, "rejected")}
                        >
                          <X className="mr-2 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
