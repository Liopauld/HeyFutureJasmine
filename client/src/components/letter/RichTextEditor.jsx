import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Sparkles
} from "lucide-react";

const PROMPTS = [
  "What are you chasing right now that you hope Future You has caught?",
  "Describe today — an ordinary one. The small stuff you'll forget.",
  "What are you afraid of today that you hope becomes a funny story?",
  "A promise to the person reading this.",
  "What do you love most about us, right now, in this season?"
];

function ToolbarButton({ onClick, active, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        active ? "bg-ink/15 text-ink" : "text-ink/55 hover:bg-ink/10 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }) {
  const [showPrompts, setShowPrompts] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit.configure({
      heading: { levels: [2, 3] },
      link: false,
      underline: false,
      trailingNode: false
    })],
    shouldRerenderOnTransaction: true,
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "letter-content min-h-[15rem] px-1 py-2" }
    }
  });

  if (!editor) return null;

  const insertPrompt = (text) => {
    editor.chain().focus().insertContent(`<p>${text}</p><p></p>`).run();
    setShowPrompts(false);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-parchment-dark pb-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-parchment-dark" />
        <ToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setShowPrompts((s) => !s)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-ink/60 transition hover:bg-ink/10 hover:text-ink"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Need a nudge?
          </button>
          {showPrompts ? (
            <div className="absolute right-0 z-20 mt-1 w-72 rounded-xl border border-parchment-dark bg-parchment p-2 shadow-xl">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => insertPrompt(p)}
                  className="block w-full rounded-lg px-3 py-2 text-left font-serif text-sm text-ink/80 transition hover:bg-ink/10"
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative">
        {editor.isEmpty ? (
          <p className="pointer-events-none absolute left-1 top-2 font-serif italic text-ink/35">
            Pour your heart onto the parchment…
          </p>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
