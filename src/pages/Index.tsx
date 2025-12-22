import { useState } from "react";
import { Header } from "@/components/Header";
import { VoiceToText } from "@/components/VoiceToText";
import { TextToVoice } from "@/components/TextToVoice";
import { CameraPreview } from "@/components/CameraPreview";
import { Accessibility, Users, Globe2, Sparkles } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState("en");

  const features = [
    {
      icon: Accessibility,
      title: "Fully Accessible",
      description: "Designed for deaf, mute, and hearing users with WCAG compliance",
    },
    {
      icon: Users,
      title: "Inclusive Design",
      description: "Large touch targets, clear contrast, and keyboard navigation",
    },
    {
      icon: Globe2,
      title: "Multilingual",
      description: "Support for English, Tamil, and Hindi languages",
    },
    {
      icon: Sparkles,
      title: "Future-Ready",
      description: "Built for AI-powered sign language recognition",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header language={language} onLanguageChange={setLanguage} />

      <main id="main-content" className="container py-8 space-y-10">
        {/* Hero section */}
        <section className="text-center space-y-4 py-6 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Breaking Barriers in{" "}
            <span className="gradient-text">Communication</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An inclusive platform for voice, text, and sign language communication. 
            Accessible to everyone, everywhere.
          </p>
        </section>

        {/* Feature highlights */}
        <section aria-labelledby="features-heading" className="py-4">
          <h3 id="features-heading" className="sr-only">Platform Features</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 mb-3">
                  <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Main communication tools */}
        <section aria-labelledby="tools-heading" className="space-y-6">
          <h3 id="tools-heading" className="sr-only">Communication Tools</h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <VoiceToText 
              language={language} 
              onTextRecognized={(text) => console.log("Recognized:", text)}
            />
            <TextToVoice language={language} />
          </div>

          <CameraPreview />
        </section>

        {/* Accessibility notice */}
        <section 
          aria-labelledby="accessibility-heading"
          className="py-6 px-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
        >
          <h3 id="accessibility-heading" className="text-lg font-semibold text-foreground mb-2">
            Accessibility First
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This platform is designed with accessibility at its core. All features support 
            keyboard navigation, screen readers, and provide clear visual feedback. 
            We're committed to making communication accessible for everyone.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-10">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            SignSpeak — Empowering inclusive communication
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Built with accessibility and inclusion in mind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
