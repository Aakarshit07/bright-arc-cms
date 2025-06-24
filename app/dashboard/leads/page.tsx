"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContactStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, Phone, Calendar, MessageSquare } from "lucide-react";

export default function ContactsPage() {
  const { contacts, isLoading, fetchContacts } = useContactStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contacts</h1>
        <p className="text-muted-foreground">
          View and manage contact form submissions
        </p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
            <p className="text-muted-foreground text-center">
              Contact form submissions will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card
              key={contact._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">
                      {contact.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {contact.source}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{contact.mobile}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">Message:</h4>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md line-clamp-3">
                    {contact.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
