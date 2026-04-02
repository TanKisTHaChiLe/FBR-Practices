import React, { useState } from "react";
import { Edit2, Trash2, Save, X } from "lucide-react";
import type { Note } from "../types";

interface NoteListProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onUpdateNote: (id: string, text: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onDeleteNote,
  onUpdateNote,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleSave = (id: string) => {
    if (editText.trim()) {
      onUpdateNote(id, editText.trim());
      setEditingId(null);
      setEditText("");
    }
  };

  const handleDelete = (id: string) => {
    onDeleteNote(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSave(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-50">✨</div>
        <p className="text-amber-700/50 text-lg"></p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note, index) => (
        <li
          key={note.id}
          className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm 
                     rounded-xl border border-amber-500/20 hover:border-amber-500/40 
                     transition-all duration-300 hover:-translate-y-0.5"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="p-4 flex items-start justify-between gap-4">
            {editingId === note.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-black/50 border-2 border-amber-500 
                             rounded-lg text-amber-100 focus:outline-none 
                             focus:ring-2 focus:ring-amber-500/30"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleSave(note.id)}
                  onKeyDown={(e) => handleKeyPress(e, note.id)}
                  autoFocus
                />
                <button
                  onClick={() => handleSave(note.id)}
                  className="text-amber-500 hover:text-amber-400 transition-colors p-2"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-amber-700 hover:text-amber-600 transition-colors p-2"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-amber-100 text-base leading-relaxed mb-2 break-words">
                    {note.text}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-amber-500/70 hover:text-amber-400 transition-colors p-2 
                               rounded-lg hover:bg-amber-500/10"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600/50 hover:text-red-500 transition-colors p-2 
                               rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
