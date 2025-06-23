"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Edit, Check, X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    // Display capitalized version for editing
    setEditValue(currentName.charAt(0).toUpperCase() + currentName.slice(1));
  };

  const handleSave = async (urlKey: string) => {
    if (editValue.trim()) {
      // Send the value as-is, backend will convert to lowercase
      const success = await updateCategory(urlKey, editValue.trim());
      if (success) {
        toast({
          title: "Category updated",
          description: "The category name has been successfully updated",
        });
        setEditingId(null);
        setEditValue("");
      } else {
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleCreate = async () => {
    if (newCategoryName.trim()) {
      // Send the value as-is, backend will convert to lowercase
      const success = await createCategory(newCategoryName.trim());
      if (success) {
        toast({
          title: "Category created",
          description: "New category has been successfully created",
        });
        setNewCategoryName("");
        setIsCreateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create category",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (urlKey: string, categoryName: string) => {
    const success = await deleteCategory(categoryName);
    if (success) {
      toast({
        title: "Category deleted",
        description: `Category "${categoryName}" has been successfully deleted`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your blog categories</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category for your blog posts.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Categories</CardTitle>
          <CardDescription>
            Manage your blog categories. You can edit names or delete unused
            categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center space-x-2 p-3 border rounded-lg"
              >
                {editingId === category._id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(category.urlKey);
                        if (e.key === "Escape") handleCancel();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(category.urlKey)}
                      disabled={!editValue.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      {/* Display capitalized category name for UI */}
                      <p className="font-medium">
                        {category.categoryName.charAt(0).toUpperCase() +
                          category.categoryName.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{category.urlKey}
                      </p>
                      {/* Show active status */}
                      <p className="text-xs text-muted-foreground">
                        Status:{" "}
                        {category.activeStatus === "active"
                          ? "✅ Active"
                          : "❌ Inactive"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEdit(category._id, category.categoryName)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "
                            {category.categoryName}"? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(
                                category.urlKey,
                                category.categoryName
                              )
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
