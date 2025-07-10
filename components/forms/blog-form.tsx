"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCategoryStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Blog, BlogFormData } from "@/lib/types";
import { QuillEditor, QuillEditorRef } from "../quill-editor";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

interface BlogFormProps {
  blog?: Blog;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BlogForm({ blog, onSubmit, isLoading }: BlogFormProps) {
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoryStore();
  const editorRef = useRef<QuillEditorRef>(null);
  const [editorContent, setEditorContent] = useState(blog?.content || "");
  const [editorKey, setEditorKey] = useState(0); // Force re-mount when needed

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || "",
      content: blog?.content || "",
      author: blog?.author || "",
      category: "",
      image: blog?.image || "",
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set category when categories load and blog exists
  useEffect(() => {
    if (categories.length > 0 && blog?.category) {
      const matchingCategory = categories.find(
        (cat) =>
          cat.categoryName.toLowerCase() ===
          blog.category?.categoryName.toLowerCase()
      );
      if (matchingCategory) {
        form.setValue("category", matchingCategory._id);
      }
    }
  }, [categories, blog, form]);

  // Update editor content when blog changes
  useEffect(() => {
    if (blog?.content && blog.content !== editorContent) {
      setEditorContent(blog.content);
      // Force editor re-mount to ensure clean state
      setEditorKey((prev) => prev + 1);
    }
  }, [blog?.content]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    form.setValue("content", content, { shouldValidate: true });

    // Clear content error if user starts typing
    if (form.formState.errors.content && isContentValid(content)) {
      form.clearErrors("content");
    }
  };

  const isContentValid = (content: string): boolean => {
    if (!content) return false;
    // Remove HTML tags and check if there's actual text content
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    return textContent.length >= 10;
  };

  const handleSubmit = async (data: BlogFormData) => {
    try {
      // Additional validation for empty content
      if (!isContentValid(data.content)) {
        form.setError("content", {
          type: "manual",
          message: "Content must contain at least 10 characters of text.",
        });
        return;
      }

      // Find selected category and send lowercase name to backend
      const selectedCategory = categories.find(
        (cat) => cat._id === data.category
      );
      if (!selectedCategory) {
        form.setError("category", {
          type: "manual",
          message: "Please select a valid category.",
        });
        return;
      }

      const submitData: BlogFormData = {
        ...data,
        category: selectedCategory.categoryName.toLowerCase(),
      };

      console.log("📤 Submitting blog data:", submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error("❌ Error submitting blog:", error);
      throw error;
    }
  };

  return (
    <div className="h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="h-full flex gap-6"
        >
          {/* Left Column - Form Fields */}
          <div className="w-1/2 space-y-6 pr-3 flex flex-col">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter blog title"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter author name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories
                        .filter(
                          (category) => category.activeStatus === "active"
                        )
                        .map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.categoryName.charAt(0).toUpperCase() +
                              category.categoryName.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {categoriesLoading && (
                    <p className="text-xs text-muted-foreground">
                      Loading categories...
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Preview */}
            {form.watch("image") && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Image Preview:</p>
                <img
                  src={form.watch("image") || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {blog ? "Update Blog" : "Create Blog"}
            </Button>
          </div>

          {/* Right Column - Quill Editor */}
          <div className="w-1/2 pl-3">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="h-full flex flex-col">
                  <FormLabel>Content *</FormLabel>
                  <FormControl className="flex-1">
                    <QuillEditor
                      key={editorKey}
                      ref={editorRef}
                      value={editorContent}
                      onChange={handleEditorChange}
                      placeholder="Start writing your blog content..."
                      height="calc(100vh - 400px)"
                      className="flex-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
