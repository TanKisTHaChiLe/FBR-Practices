import { NoteForm } from "./components/NoteForm";
import { NoteList } from "./components/NoteList";
import { NetworkStatus } from "./components/NetworkStatus";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { useServiceWorker } from "./hooks/useServiceWorker";
import type { Note } from "./types";
import { Flame, Moon, Sparkles } from "lucide-react";

function App() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const isOnline = useNetworkStatus();
  const { isRegistered, updateAvailable, updateServiceWorker } =
    useServiceWorker();

  const addNote = (text: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const updateNote = (id: string, newText: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, text: newText, updatedAt: new Date() }
          : note,
      ),
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Звездное небо */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-100"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      {/* Огненные частицы */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none h-64">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-orange-500"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              bottom: "0",
              animation: `fireParticle ${Math.random() * 3 + 2}s infinite ease-out`,
              animationDelay: Math.random() * 5 + "s",
              opacity: 0,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        {/* Магическая луна */}
        <div className="absolute top-8 right-8 opacity-30 pointer-events-none">
          <div className="relative">
            <Moon size={80} className="text-yellow-200/40" />
            <div className="absolute inset-0 rounded-full bg-yellow-200 blur-2xl opacity-50"></div>
          </div>
        </div>

        {/* Костер снизу слева */}
        <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-40">
          <div className="relative">
            <Flame size={60} className="text-orange-500 fire-glow" />
            <div className="absolute inset-0 blur-3xl bg-orange-500/30"></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-yellow-500 fire-glow" size={28} />
            <h1 className="text-5xl font-light tracking-wide bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Заметки
            </h1>
            <Sparkles className="text-yellow-500 fire-glow" size={28} />
          </div>
        </div>

        {/* Main Card */}
        <div className="backdrop-blur-md bg-black/30 rounded-3xl border border-amber-500/20 shadow-2xl p-6 md:p-8">
          <NoteForm onAddNote={addNote} isOnline={isOnline} />
          <NoteList
            notes={notes}
            onDeleteNote={deleteNote}
            onUpdateNote={updateNote}
          />
        </div>
      </div>

      <NetworkStatus
        isOnline={isOnline}
        swRegistered={isRegistered}
        updateAvailable={updateAvailable}
        onUpdate={updateServiceWorker}
      />
    </div>
  );
}

export default App;
