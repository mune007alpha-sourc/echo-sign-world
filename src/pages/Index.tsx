import { useState } from "react";
import { Header } from "@/components/Header";
import { VoiceToText } from "@/components/VoiceToText";
import { TextToVoice } from "@/components/TextToVoice";
import { SignDetection } from "@/components/SignDetection";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { Accessibility, Users, Globe2, Hand, Mic, MessageSquare } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState("en");
  const [detectedSignText, setDetectedSignText] = useState("");

  const features = [
    {
      icon: Hand,
      title: "Sign Language Detection",
      description: "Real-time recognition of ASL signs using your camera",
    },
    {
      icon: Accessibility,
      title: "Fully Accessible",
      description: "Designed for deaf, mute, and hearing users with WCAG compliance",
    },
    {
      icon: Globe2,
      title: "Multilingual Output",
      description: "See detected signs in English, Tamil, or Hindi",
    },
    {
      icon: Users,
      title: "Inclusive Design",
      description: "Large touch targets, clear contrast, and keyboard navigation",
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Hand className="h-4 w-4" />
            Live Sign Language Detection
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Communicate Through{" "}
            <span className="gradient-text">Sign Language</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Show signs to your camera and see them converted to text in real-time. 
            Choose your preferred language for the output.
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

        {/* PRIMARY: Sign Language Detection */}
        <section aria-labelledby="sign-detection-section" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Hand className="h-5 w-5 text-primary" />
            <h3 id="sign-detection-section" className="text-lg font-semibold text-foreground">
              Main Feature: Sign Language Detection
            </h3>
          </div>
          
          <SignDetection 
            language={language} 
            onDetection={setDetectedSignText}
          />

          {/* Speak detected text */}
          {detectedSignText && (
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-muted/50">
              <p className="text-foreground font-medium">Detected: "{detectedSignText}"</p>
              <TextToSpeechButton text={detectedSignText} language={language} />
            </div>
          )}
        </section>

        {/* SECONDARY: Voice features */}
        <section aria-labelledby="voice-tools-heading" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <h3 id="voice-tools-heading" className="text-lg font-semibold text-foreground">
              Voice Support (For Hearing Users)
            </h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <VoiceToText 
              language={language} 
              onTextRecognized={(text) => console.log("Recognized:", text)}
            />
            <TextToVoice language={language} />
          </div>
        </section>

        {/* Accessibility notice */}
        <section 
          aria-labelledby="accessibility-heading"
          className="py-6 px-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
        >
          <h3 id="accessibility-heading" className="text-lg font-semibold text-foreground mb-2">
            Built for Accessibility
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SignSpeak is designed with deaf, mute, and hearing users in mind. All features support 
            keyboard navigation, screen readers, and provide clear visual feedback. 
            Sign language is the primary input method — no voice required.
          </p>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works-heading" className="py-6">
          <h3 id="how-it-works-heading" className="text-lg font-semibold text-foreground mb-4 text-center">
            How It Works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-medium text-foreground mb-1">Start Camera</h4>
              <p className="text-xs text-muted-foreground">
                Allow camera access to begin detection
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-medium text-foreground mb-1">Show Signs</h4>
              <p className="text-xs text-muted-foreground">
                Perform sign language gestures in front of your camera
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-medium text-foreground mb-1">See Text</h4>
              <p className="text-xs text-muted-foreground">
                View detected signs as text in your chosen language
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-10">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            SignSpeak — Live Sign Language Detection Platform
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Built with accessibility and inclusion at its core
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
