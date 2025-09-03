"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { getAllTemplates } from "@/lib/templateMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Palette, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const templates = getAllTemplates();

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/design/${templateId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Certificate Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Create beautiful certificates in minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a professionally designed template or create from
            scratch. Each template is fully customizable and perfect for
            certificates, awards, and achievements.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Start with Your Design
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Upload your own background image or design and customize it
                  </p>
                  <Button
                    onClick={() => handleTemplateSelect("blank")}
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:cursor-pointer"
                  >
                    Start from Blank Canvas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Palette className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Browse Templates
                  </h3>
                  <p className="text-purple-100 mb-4">
                    Choose from our collection of professional templates
                  </p>
                  <Button
                    onClick={() => {
                      document
                        .getElementById("templates-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-purple-50 hover:cursor-pointer"
                  >
                    Browse Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Section */}
        <div id="templates-section">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Professional Templates
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div
                    className={`h-32 flex items-center justify-center text-gray-500 rounded-lg mb-3 border-2 border-dashed`}
                  >
                    {template.id === "blank" ? (
                      <div className="text-center">
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-xs font-medium">Blank Canvas</div>
                        <div className="text-xs opacity-70">Start Fresh</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg mb-1">🏆</div>
                        <div className="text-xs font-medium">
                          {template.name}
                        </div>
                        <div className="text-xs opacity-70">Certificate</div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {template.id === "blank"
                        ? "Fully customizable"
                        : "Professional design"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-sm border p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose Our Certificate Generator?
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Professional Quality
              </h4>
              <p className="text-gray-600 text-sm">
                High-quality templates designed by professionals for various
                occasions and achievements.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Fully Customizable
              </h4>
              <p className="text-gray-600 text-sm">
                Customize every element including text, colors, fonts, and
                layouts to match your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Export Ready</h4>
              <p className="text-gray-600 text-sm">
                Export your certificates in high-quality PNG or PDF formats
                ready for printing or sharing.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Certificate Generator. Create professional certificates with
            ease.
          </p>
        </div>
      </footer>
    </div>
  );
}
