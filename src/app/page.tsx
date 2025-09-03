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
    <div className="min-h-screen bg-gradient-to-br from-[var(--muted)] via-[var(--background)] to-[var(--accent)]">
      {/* Header */}
      <header className="bg-[var(--background)] shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sparkles className="h-6 w-6 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Certificate Generator
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
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
          <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Choose Your Template
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
            Start with a professionally designed template or create from
            scratch. Each template is fully customizable and perfect for
            certificates, awards, and achievements.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-primary to-primary/40 text-[var(--primary-foreground)] border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--primary-foreground)]/20 rounded-lg">
                  <ImageIcon className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Start with Your Design
                  </h3>
                  <p className="text-[var(--primary-foreground)]/80 mb-4">
                    Upload your own background image or design and customize it
                  </p>
                  <Button
                    onClick={() => handleTemplateSelect("blank")}
                    variant="secondary"
                    className="bg-[var(--primary-foreground)] text-[var(--primary)] hover:bg-[var(--primary-foreground)]/90 hover:cursor-pointer"
                  >
                    Start from Blank Canvas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-secondary to-secondary/40 text-secondary-foreground border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary-foreground/20 rounded-lg">
                  <Palette className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-secondary-foreground font-semibold mb-2">
                    Browse Templates
                  </h3>
                  <p className="text-secondary-foreground/80 mb-4">
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
                    className="bg-primary/20 text-secondary-foreground hover:bg-primary/40 hover:cursor-pointer"
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
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-8 text-center">
            Professional Templates
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow border-[var(--border)] bg-[var(--card)]"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div
                    className={`h-32 flex items-center justify-center text-[var(--muted-foreground)] rounded-lg mb-3 border-2 border-dashed border-[var(--border)]`}
                  >
                    {template.id === "blank" ? (
                      <div className="text-center">
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-xs font-medium text-[var(--foreground)]">
                          Blank Canvas
                        </div>
                        <div className="text-xs opacity-70 text-[var(--muted-foreground)]">
                          Start Fresh
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg mb-1">🏆</div>
                        <div className="text-xs font-medium text-[var(--foreground)]">
                          {template.name}
                        </div>
                        <div className="text-xs opacity-70 text-[var(--muted-foreground)]">
                          Certificate
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h4 className="font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
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
        <div className="mt-20 bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] p-8">
          <h3 className="text-2xl font-bold text-center text-[var(--foreground)] mb-8">
            Why Choose Our Certificate Generator?
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-[var(--primary)]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                Professional Quality
              </h4>
              <p className="text-[var(--muted-foreground)] text-sm">
                High-quality templates designed by professionals for various
                occasions and achievements.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-[var(--accent)]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Palette className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                Fully Customizable
              </h4>
              <p className="text-[var(--muted-foreground)] text-sm">
                Customize every element including text, colors, fonts, and
                layouts to match your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-[var(--chart-3)]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-[var(--chart-3)]" />
              </div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                Export Ready
              </h4>
              <p className="text-[var(--muted-foreground)] text-sm">
                Export your certificates in high-quality PNG or PDF formats
                ready for printing or sharing.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary/90 text-primary-foreground py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-foreground">
            © 2025 Certificate Generator. Create professional certificates with
            ease.
          </p>
        </div>
      </footer>
    </div>
  );
}
