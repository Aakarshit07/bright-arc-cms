"use client";

import { useState, useEffect, useCallback } from "react";
import { useCategoryStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import type { Blog, Category } from "@/lib/types";

interface UseBlogsByCategoryReturn {
  categories: Category[];
  blogs: Blog[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  setSelectedCategory: (categoryName: string) => void;
  refreshBlogs: () => Promise<void>;
}

export function useBlogsByCategory(): UseBlogsByCategoryReturn {
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoryStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set first category as selected when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].categoryName);
    }
  }, [categories, selectedCategory]);

  // Fetch blogs by category
  const fetchBlogsByCategory = useCallback(async (categoryName: string) => {
    if (!categoryName) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getBlogsByCategory(categoryName);

      if (result.error) {
        setError(result.error);
        setBlogs([]);
      } else {
        // Sort blogs by postDate in descending order (newest first)
        const sortedBlogs = (result.data || []).sort((a, b) => {
          return (
            new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
          );
        });
        setBlogs(sortedBlogs);
      }
    } catch (err) {
      setError("Failed to fetch blogs");
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch blogs when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchBlogsByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchBlogsByCategory]);

  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
  }, []);

  const refreshBlogs = useCallback(async () => {
    if (selectedCategory) {
      await fetchBlogsByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchBlogsByCategory]);

  return {
    categories,
    blogs,
    selectedCategory,
    isLoading: isLoading || categoriesLoading,
    error,
    setSelectedCategory: handleCategoryChange,
    refreshBlogs,
  };
}
