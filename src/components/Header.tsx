import { Hand } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
            <Hand className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              SignSpeak
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Multilingual Communication Platform
            </p>
          </div>
        </div>

        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}
