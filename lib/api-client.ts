import type {
  ApiResponse,
  Blog,
  Category,
  Contact,
  Comment,
  BlogFormData,
} from "./types";

class ApiClient {
  private static instance: ApiClient;
  private backendUrl: string;

  private constructor() {
    this.backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data, message: data.message };
    } catch (error) {
      console.error("API request failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return { error: "Network error. Please check your connection." };
      }

      return { error: "An unexpected error occurred" };
    }
  }

  // Category methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.makeRequest(`${this.backendUrl}/api/categories`);
  }

  async createCategory(categoryName: string): Promise<ApiResponse<Category>> {
    // Send lowercase category name to match backend schema
    return this.makeRequest(`${this.backendUrl}/api/categories`, {
      method: "POST",
      body: JSON.stringify({ categoryName: categoryName.toLowerCase() }),
    });
  }

  async updateCategory(
    urlKey: string,
    categoryName: string
  ): Promise<ApiResponse<Category>> {
    // Send lowercase category name to match backend schema
    return this.makeRequest(`${this.backendUrl}/api/categories/${urlKey}`, {
      method: "PUT",
      body: JSON.stringify({ categoryName: categoryName.toLowerCase() }),
    });
  }

  async deleteCategory(categoryName: string): Promise<ApiResponse<Category>> {
    return this.makeRequest(
      `${this.backendUrl}/api/categories/${categoryName}`,
      {
        method: "DELETE",
      }
    );
  }

  // Blog methods
  async getBlogs(): Promise<ApiResponse<Blog[]>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs`);
  }

  async getBlogBySlug(slug: string): Promise<ApiResponse<Blog>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}`);
  }

  async getBlogsByCategory(categoryName: string): Promise<ApiResponse<Blog[]>> {
    // Send lowercase category name to match backend schema
    return this.makeRequest(
      `${this.backendUrl}/api/blogs/category/${categoryName.toLowerCase()}`
    );
  }

  async createBlog(blog: BlogFormData): Promise<ApiResponse<Blog>> {
    // Ensure category is sent as lowercase to match backend schema
    const blogData = {
      ...blog,
      category: blog.category.toLowerCase(), // Convert to lowercase for backend
    };

    console.log("🚀 Creating blog with data:", blogData);
    return this.makeRequest(`${this.backendUrl}/api/blogs`, {
      method: "POST",
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(
    slug: string,
    blog: Partial<BlogFormData>
  ): Promise<ApiResponse<Blog>> {
    // Ensure category is sent as lowercase to match backend schema
    const blogData = {
      ...blog,
      ...(blog.category && { category: blog.category.toLowerCase() }), // Convert to lowercase for backend
    };

    console.log("🔄 Updating blog with data:", blogData);
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}`, {
      method: "PUT",
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(slug: string): Promise<ApiResponse<Blog>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}`, {
      method: "DELETE",
    });
  }

  // Comment methods
  async getComments(
    slug: string,
    status?: string
  ): Promise<ApiResponse<{ total: number; comments: Comment[] }>> {
    const url = status
      ? `${this.backendUrl}/api/blogs/${slug}/comments?status=${status}`
      : `${this.backendUrl}/api/blogs/${slug}/comments`;
    return this.makeRequest(url);
  }

  async addComment(
    slug: string,
    comment: { user: string; text: string }
  ): Promise<ApiResponse<Comment>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
    });
  }

  async updateCommentStatus(
    slug: string,
    commentId: string,
    status: "approved" | "rejected"
  ): Promise<ApiResponse<Comment>> {
    return this.makeRequest(
      `${this.backendUrl}/api/blogs/${slug}/comments/${commentId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  }

  // Like methods
  async likeBlog(slug: string): Promise<ApiResponse<{ likeCount: number }>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}/like`, {
      method: "POST",
    });
  }

  async unlikeBlog(slug: string): Promise<ApiResponse<{ likeCount: number }>> {
    return this.makeRequest(`${this.backendUrl}/api/blogs/${slug}/unlike`, {
      method: "POST",
    });
  }

  // Contact methods
  async getContacts(): Promise<ApiResponse<Contact[]>> {
    return this.makeRequest(`${this.backendUrl}/api/contact`);
  }

  async submitContact(
    contact: Omit<Contact, "_id" | "createdAt">
  ): Promise<ApiResponse<Contact>> {
    return this.makeRequest(`${this.backendUrl}/api/contact`, {
      method: "POST",
      body: JSON.stringify(contact),
    });
  }
}

export const apiClient = ApiClient.getInstance();
