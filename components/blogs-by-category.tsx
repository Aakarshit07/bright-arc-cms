"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  MessageSquare,
  Clock,
  FileText,
  Heart,
  Edit,
  Trash2,
} from "lucide-react";
import { useBlogsByCategory } from "@/hooks/use-blogs-by-category";
import type { Blog } from "@/lib/types";
import Link from "next/link";
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

interface BlogsByCategoryProps {
  onBlogSelect?: (blog: Blog) => void;
  selectedBlogSlug?: string;
  showCommentCount?: boolean;
  cardSize?: "sm" | "md" | "lg";
  //   title?: string;
  //   description?: string;
  variant?: "list" | "cards"; // New prop for different layouts
  onBlogDelete?: (slug: string) => Promise<void>;
  deletingSlug?: string | null;
  //   blogs: Blog[]; // Optional prop to pass pre-fetched blogs
}

export function BlogsByCategory({
  onBlogSelect,
  selectedBlogSlug,
  showCommentCount = true,
  cardSize = "md",
  //   title = "Blogs by Category",
  //   description = "Select a blog to view details",
  variant = "list",
  onBlogDelete,
  deletingSlug,
}: BlogsByCategoryProps) {
  const {
    categories,
    blogs,
    selectedCategory,
    isLoading,
    error,
    setSelectedCategory,
  } = useBlogsByCategory();

  const getCardSizeClasses = () => {
    switch (cardSize) {
      case "sm":
        return "h-auto p-2";
      case "lg":
        return "h-auto p-4";
      default:
        return "h-auto p-3";
    }
  };

  const getTextSizeClasses = () => {
    switch (cardSize) {
      case "sm":
        return { title: "text-sm", meta: "text-xs" };
      case "lg":
        return { title: "text-base", meta: "text-sm" };
      default:
        return { title: "text-sm", meta: "text-xs" };
    }
  };

  const textClasses = getTextSizeClasses();

  // Render list variant (for comments page)
  const renderListVariant = () => (
    <div className="grid gap-2 max-h-[400px] overflow-y-auto">
      {blogs.map((blog) => (
        <Button
          key={blog._id}
          variant={selectedBlogSlug === blog.slug ? "default" : "outline"}
          className={`justify-start text-left ${getCardSizeClasses()}`}
          onClick={() => onBlogSelect?.(blog)}
        >
          <div className="flex-1 min-w-0">
            <div className={`font-medium truncate ${textClasses.title}`}>
              {blog.title}
            </div>
            {showCommentCount && (
              <div
                className={`flex items-center space-x-2 text-muted-foreground mt-1 ${textClasses.meta}`}
              >
                <span>{blog.commentCount} comments</span>
                {blog.commentCount > 0 && <Clock className="h-3 w-3" />}
              </div>
            )}
            <div className={`text-muted-foreground mt-1 ${textClasses.meta}`}>
              By {blog.author} • {new Date(blog.postDate).toLocaleDateString()}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );

  // Render cards variant (for blogs page)
  const renderCardsVariant = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <Card key={blog._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between space-x-2">
              <CardTitle className="text-base line-clamp-2 leading-tight">
                {blog.title}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {blog.category?.categoryName
                  ? blog.category.categoryName.charAt(0).toUpperCase() +
                    blog.category.categoryName.slice(1)
                  : "Uncategorized"}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              By {blog.author} • {new Date(blog.postDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <div
              className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Heart className="mr-1 h-3 w-3" />
                  {blog.likeCount}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  {blog.commentCount}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Link href={`/dashboard/blogs/create?edit=${blog.slug}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </Link>

                {onBlogDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
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
                          onClick={() => onBlogDelete(blog.slug)}
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (categories.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No categories available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category._id}
              value={category.categoryName}
              className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.categoryName.charAt(0).toUpperCase() +
                category.categoryName.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent
            key={category._id}
            value={category.categoryName}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      {category.categoryName.charAt(0).toUpperCase() +
                        category.categoryName.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      {isLoading
                        ? "Loading blogs..."
                        : `${blogs.length} blog${
                            blogs.length !== 1 ? "s" : ""
                          } in this category`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{blogs.length} posts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-destructive mb-2">
                      Error loading blogs
                    </p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No blogs in{" "}
                      {category.categoryName.charAt(0).toUpperCase() +
                        category.categoryName.slice(1)}
                    </p>
                  </div>
                ) : variant === "list" ? (
                  renderListVariant()
                ) : (
                  renderCardsVariant()
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
