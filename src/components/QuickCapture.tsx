import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Search, LayoutDashboard, Target, Inbox, MessageSquare, Settings } from "lucide-react";
import type { ActionItem } from "@/hooks/useActionInbox";

const navCommands = [
  { label: "Command Center", icon: LayoutDashboard, path: "/" },
  { label: "Focus Mode", icon: Target, path: "/focus" },
  { label: "Inbox", icon: Inbox, path: "/inbox" },
  { label: "Chat", icon: MessageSquare, path: "/chat" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

type Props = {
  items: ActionItem[];
  onCapture: (title: string) => Promise<any>;
  onQuickAdd: () => void;
};

export default function QuickCapture({ items, onCapture, onQuickAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCapture = async () => {
    if (!value.trim()) return;
    await onCapture(value.trim());
    setValue("");
    setOpen(false);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Capture a thought, search tasks, or navigate..."
          value={value}
          onValueChange={setValue}
        />
        <CommandList>
          {value.trim() && (
            <CommandGroup heading="Capture">
              <CommandItem onSelect={handleCapture}>
                <Brain className="mr-2 h-4 w-4 text-purple-400" />
                <span>Capture: "{value}"</span>
              </CommandItem>
              <CommandItem onSelect={onQuickAdd}>
                <Plus className="mr-2 h-4 w-4 text-purple-400" />
                <span>Add with details...</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Navigate">
            {navCommands.map((cmd) => (
              <CommandItem
                key={cmd.path}
                onSelect={() => {
                  navigate(cmd.path);
                  setOpen(false);
                }}
              >
                <cmd.icon className="mr-2 h-4 w-4" />
                {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {value.trim() && (
            <CommandGroup heading="Tasks">
              {items
                .filter((i) => i.title.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5)
                .map((item) => (
                  <CommandItem key={item.id}>
                    <Search className="mr-2 h-4 w-4" />
                    {item.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
          <CommandEmpty>No results. Press Enter to capture as a new thought.</CommandEmpty>
        </CommandList>
      </CommandDialog>

      {/* Floating brain dump button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-purple-600 shadow-lg shadow-purple-900/50 hover:bg-purple-700"
        size="icon"
      >
        <Brain className="h-5 w-5 animate-pulse" />
      </Button>
    </>
  );
}
