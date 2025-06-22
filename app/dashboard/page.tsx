"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBlogStore, useContactStore } from "@/lib/store"
import { FileText, MessageSquare, Mail, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { blogs, fetchBlogs } = useBlogStore()
  const { contacts, fetchContacts } = useContactStore()

  useEffect(() => {
    fetchBlogs()
    fetchContacts()
  }, [fetchBlogs, fetchContacts])

  const totalLikes = blogs.reduce((sum, blog) => sum + blog.likeCount, 0)
  const totalComments = blogs.reduce((sum, blog) => sum + blog.commentCount, 0)

  const stats = [
    {
      title: "Total Blogs",
      value: blogs.length,
      description: "Published articles",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Total Likes",
      value: totalLikes,
      description: "Across all blogs",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Total Comments",
      value: totalComments,
      description: "User engagement",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Contact Submissions",
      value: contacts.length,
      description: "New inquiries",
      icon: Mail,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your blog content management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Blogs</CardTitle>
            <CardDescription>Your latest published articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogs.slice(0, 5).map((blog) => (
                <div key={blog._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium truncate">{blog.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {blog.category} • {blog.likeCount} likes
                    </p>
                  </div>
                </div>
              ))}
              {blogs.length === 0 && <p className="text-sm text-muted-foreground">No blogs yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.email} • {contact.source}
                    </p>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-sm text-muted-foreground">No contacts yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
