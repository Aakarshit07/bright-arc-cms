"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { SerializedEditorState } from "lexical";
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
import { Editor } from "@/components/blocks/editor-00/editor";
import { useCategoryStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Blog, BlogFormData } from "@/lib/types";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// Helper function to create empty Lexical state
const createEmptyLexicalState = (): SerializedEditorState => {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
};

// Helper function to convert HTML to Lexical initial state
const htmlToLexicalState = (html: string): SerializedEditorState => {
  if (!html || html.trim() === "" || html === "<p></p>") {
    return createEmptyLexicalState();
  }

  try {
    // Simple HTML to Lexical conversion
    const textContent = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!textContent) {
      return createEmptyLexicalState();
    }

    // Split by common HTML elements to create paragraphs
    const paragraphs = html
      .split(/<\/p>|<br\s*\/?>|<\/div>|<\/h[1-6]>/)
      .filter((p) => {
        const text = p.replace(/<[^>]*>/g, "").trim();
        return text.length > 0;
      });

    const children = paragraphs.map((paragraph, index) => {
      const text = paragraph.replace(/<[^>]*>/g, "").trim();
      const isBold =
        paragraph.includes("<strong>") || paragraph.includes("<b>");
      const isItalic = paragraph.includes("<em>") || paragraph.includes("<i>");

      let format = 0;
      if (isBold) format |= 1;
      if (isItalic) format |= 2;

      // Check if it's a heading
      const headingMatch = paragraph.match(/<h([1-6])[^>]*>/i);
      if (headingMatch) {
        return {
          children: [
            {
              detail: 0,
              format,
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          tag: `h${headingMatch[1]}`,
          version: 1,
        };
      }

      return {
        children: [
          {
            detail: 0,
            format,
            mode: "normal",
            style: "",
            text,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      };
    });

    return {
      root: {
        children:
          children.length > 0
            ? children
            : [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: textContent,
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    } as unknown as SerializedEditorState;
  } catch (error) {
    console.error("Error converting HTML to Lexical state:", error);
    return createEmptyLexicalState();
  }
};

// Helper function to convert Lexical state to HTML
const lexicalStateToHtml = (state: SerializedEditorState): string => {
  try {
    if (!state || !state.root || !state.root.children) {
      return "<p></p>";
    }

    const root = state.root;
    let html = "";

    root.children.forEach((child: any) => {
      if (child.type === "paragraph") {
        html += "<p>";
        if (child.children && child.children.length > 0) {
          child.children.forEach((textNode: any) => {
            if (textNode.type === "text") {
              let text = textNode.text || "";

              // Apply formatting based on format flags
              if (textNode.format) {
                if (textNode.format & 1) text = `<strong>${text}</strong>`; // Bold
                if (textNode.format & 2) text = `<em>${text}</em>`; // Italic
                if (textNode.format & 4) text = `<s>${text}</s>`; // Strikethrough
                if (textNode.format & 8) text = `<u>${text}</u>`; // Underline
                if (textNode.format & 16) text = `<code>${text}</code>`; // Code
              }

              html += text;
            } else if (textNode.type === "link") {
              html += `<a href="${textNode.url || "#"}">`;
              if (textNode.children) {
                textNode.children.forEach((linkChild: any) => {
                  if (linkChild.type === "text") {
                    html += linkChild.text || "";
                  }
                });
              }
              html += "</a>";
            }
          });
        }
        html += "</p>";
      } else if (child.type === "heading") {
        const level = child.tag || "h1";
        html += `<${level}>`;
        if (child.children && child.children.length > 0) {
          child.children.forEach((textNode: any) => {
            if (textNode.type === "text") {
              html += textNode.text || "";
            }
          });
        }
        html += `</${level}>`;
      } else if (child.type === "list") {
        const listTag = child.listType === "number" ? "ol" : "ul";
        html += `<${listTag}>`;
        if (child.children && child.children.length > 0) {
          child.children.forEach((listItem: any) => {
            if (listItem.type === "listitem") {
              html += "<li>";
              if (listItem.children && listItem.children.length > 0) {
                listItem.children.forEach((textNode: any) => {
                  if (textNode.type === "text") {
                    html += textNode.text || "";
                  }
                });
              }
              html += "</li>";
            }
          });
        }
        html += `</${listTag}>`;
      } else if (child.type === "quote") {
        html += "<blockquote>";
        if (child.children && child.children.length > 0) {
          child.children.forEach((textNode: any) => {
            if (textNode.type === "text") {
              html += textNode.text || "";
            }
          });
        }
        html += "</blockquote>";
      } else if (child.type === "code") {
        html += `<pre><code>${child.children?.[0]?.text || ""}</code></pre>`;
      }
    });

    return html || "<p></p>";
  } catch (error) {
    console.error("Error converting Lexical state to HTML:", error);
    return "<p></p>";
  }
};

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
  const [editorState, setEditorState] = useState<SerializedEditorState>(
    blog?.content ? htmlToLexicalState(blog.content) : createEmptyLexicalState()
  );

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || "",
      content: blog?.content || "",
      author: blog?.author || "",
      category: "", // Will be set after categories load
      image: blog?.image || "",
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set form category value when categories load or blog changes
  useEffect(() => {
    if (categories.length > 0 && blog?.category) {
      // Find matching category by comparing lowercase names
      const matchingCategory = categories.find(
        (cat) =>
          cat.categoryName.toLowerCase() ===
          blog.category.categoryName.toLowerCase()
      );

      if (matchingCategory) {
        // Store the category ID in form for selection, but we'll send lowercase name to backend
        form.setValue("category", matchingCategory._id);
      }
    }
  }, [categories, blog, form]);

  // Update editor state when blog prop changes
  useEffect(() => {
    if (blog?.content) {
      const lexicalState = htmlToLexicalState(blog.content);
      setEditorState(lexicalState);
      form.setValue("content", blog.content);
    }
  }, [blog, form]);

  const handleSubmit = async (data: BlogFormData) => {
    try {
      // Find the selected category by ID
      const selectedCategory = categories.find(
        (cat) => cat._id === data.category
      );

      if (!selectedCategory) {
        throw new Error("Invalid category selected");
      }

      // 🔥 IMPORTANT: Send lowercase category name to backend (matches your schema)
      const submitData = {
        ...data,
        category: selectedCategory.categoryName.toLowerCase(), // Backend expects lowercase category name
      };

      console.log("📤 Submitting blog data:", submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error("❌ Error submitting blog:", error);
      throw error;
    }
  };

  const handleEditorChange = (value: SerializedEditorState) => {
    setEditorState(value);
    const html = lexicalStateToHtml(value);
    form.setValue("content", html, { shouldValidate: true });
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
                        ) // Only show active categories
                        .map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {/* Display capitalized version for UI, but store ID */}
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
                  {categories.length === 0 && !categoriesLoading && (
                    <p className="text-xs text-muted-foreground">
                      No categories available
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

            {/* Preview image if URL is provided */}
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

            {/* Spacer to push button to bottom */}
            <div className="flex-1" />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {blog ? "Update Blog" : "Create Blog"}
            </Button>
          </div>

          {/* Right Column - Lexical Editor */}
          <div className="w-1/2 pl-3">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="h-full flex-1 flex flex-col">
                  <FormLabel>Content *</FormLabel>
                  <FormControl className="flex-1">
                    <div className="h-full border rounded-lg overflow-hidden bg-background">
                      <Editor
                        editorSerializedState={editorState}
                        onSerializedChange={handleEditorChange}
                      />
                    </div>
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
