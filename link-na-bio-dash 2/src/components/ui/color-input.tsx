import { Label } from "./label";
import { Input } from "./input";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-white p-1"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
