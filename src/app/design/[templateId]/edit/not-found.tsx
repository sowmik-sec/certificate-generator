"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Template Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The template you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Back to Templates</span>
            </Button>

            <p className="text-sm text-gray-500">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
