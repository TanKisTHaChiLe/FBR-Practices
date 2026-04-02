import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Plus } from "lucide-react";

interface NoteFormProps {
  onAddNote: (text: string) => void;
  isOnline: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({ onAddNote, isOnline }) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const savedDraft = localStorage.getItem("note-draft");
    if (savedDraft) {
      setText(savedDraft);
      localStorage.removeItem("note-draft");
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();

    if (trimmedText) {
      onAddNote(trimmedText);
      setText("");
      localStorage.removeItem("note-draft");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-3">
        <input
          type="text"
          className="flex-1 px-4 py-3 bg-black/50 border border-amber-500/30 rounded-xl 
                     text-amber-100 placeholder-amber-700/50 focus:outline-none 
                     focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20
                     transition-all duration-300 backdrop-blur-sm"
          placeholder="..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) {
              localStorage.setItem("note-draft", e.target.value);
            }
          }}
          maxLength={500}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 
                     rounded-xl hover:from-amber-500 hover:to-orange-500 
                     transition-all duration-300 transform hover:scale-105 active:scale-95
                     shadow-lg hover:shadow-amber-500/25 flex items-center gap-2"
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
};
