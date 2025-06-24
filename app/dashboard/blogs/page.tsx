"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBlogStore, useCategoryStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { BlogsByCategory } from "@/components/blogs-by-category";

export default function BlogsPage() {
  const { isLoading, fetchBlogs, deleteBlog } = useBlogStore();
  const { fetchCategories } = useCategoryStore();
  const { toast } = useToast();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [fetchBlogs, fetchCategories]);

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

      <BlogsByCategory
        variant="cards"
        cardSize="md"
        // title="Blogs by Category"
        // description="Manage your blog posts organized by category"
        showCommentCount={true}
        onBlogDelete={handleDelete}
        deletingSlug={deletingSlug}
        // blogs={blogs}
        // categories={categories}
      />
    </div>
  );
}
