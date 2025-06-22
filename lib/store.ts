import { create } from "zustand";
import { apiClient } from "./api-client";
import type { Blog, Comment, Contact, Category, BlogFormData } from "./types";

interface BlogState {
  blogs: Blog[];
  isLoading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  createBlog: (blog: BlogFormData) => Promise<boolean>;
  updateBlog: (slug: string, blog: Partial<BlogFormData>) => Promise<boolean>;
  deleteBlog: (slug: string) => Promise<boolean>;
  getBlogBySlug: (slug: string) => Promise<Blog | null>;
}

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  fetchComments: (slug: string, status?: string) => Promise<void>;
  updateCommentStatus: (
    slug: string,
    commentId: string,
    status: "approved" | "rejected"
  ) => Promise<boolean>;
}

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  fetchContacts: () => Promise<void>;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (categoryName: string) => Promise<boolean>;
  updateCategory: (urlKey: string, categoryName: string) => Promise<boolean>;
  deleteCategory: (urlKey: string) => Promise<boolean>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  isLoading: false,
  error: null,

  fetchBlogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.getBlogs();
      if (result.error) {
        set({ error: result.error, isLoading: false });
      } else {
        set({ blogs: result.data || [], isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch blogs", isLoading: false });
    }
  },

  createBlog: async (blog) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.createBlog(blog);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchBlogs();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to create blog" });
      return false;
    }
  },

  updateBlog: async (slug, blog) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.updateBlog(slug, blog);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchBlogs();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to update blog" });
      return false;
    }
  },

  deleteBlog: async (slug) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.deleteBlog(slug);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchBlogs();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to delete blog" });
      return false;
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const result = await apiClient.getBlogBySlug(slug);
      return result.data || null;
    } catch (error) {
      return null;
    }
  },
}));

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,

  fetchComments: async (slug, status) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.getComments(slug, status);
      if (result.data) {
        set({ comments: result.data.comments || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateCommentStatus: async (slug, commentId, status) => {
    try {
      const result = await apiClient.updateCommentStatus(
        slug,
        commentId,
        status
      );
      if (!result.error) {
        await get().fetchComments(slug);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
}));

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  isLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const result = await apiClient.getContacts();
      if (result.data) {
        set({ contacts: result.data || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.getCategories();
      if (result.error) {
        set({ error: result.error, isLoading: false });
      } else {
        set({ categories: result.data || [], isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch categories", isLoading: false });
    }
  },

  createCategory: async (categoryName) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.createCategory(categoryName);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to create category" });
      return false;
    }
  },

  updateCategory: async (urlKey, categoryName) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.updateCategory(urlKey, categoryName);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to update category" });
      return false;
    }
  },

  deleteCategory: async (urlKey) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.deleteCategory(urlKey);
      if (result.error) {
        set({ isLoading: false, error: result.error });
        return false;
      } else {
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      }
    } catch (error) {
      set({ isLoading: false, error: "Failed to delete category" });
      return false;
    }
  },
}));
