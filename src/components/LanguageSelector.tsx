import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Language {
  code: string;
  name: string;
  speechCode: string;
}

const languages: Language[] = [
  { code: "en", name: "English", speechCode: "en-US" },
  { code: "ta", name: "தமிழ் (Tamil)", speechCode: "ta-IN" },
  { code: "hi", name: "हिंदी (Hindi)", speechCode: "hi-IN" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const selectedLang = languages.find((l) => l.code === value);

  return (
    <div className="flex items-center gap-3">
      <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-[180px] h-12 rounded-xl border-2 border-border bg-card text-base font-medium focus:ring-2 focus:ring-primary"
          aria-label="Select language"
        >
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2">
          {languages.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="text-base py-3 cursor-pointer focus:bg-primary/10"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { languages };
export type { Language };
