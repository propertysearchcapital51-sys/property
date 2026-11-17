import { useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Underline, Undo2, Unlink,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "./AdminToast";

function Btn({ onClick, active, label, children, disabled }) {
  return (
    <button type="button" className={`adm-tool ${active ? "is-active" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      {children}
    </button>
  );
}

/* WYSIWYG editor. Output is HTML; the server sanitises it again before saving. */
export default function RichTextEditor({ value, onChange }) {
  const toast = useToast();
  const fileInput = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Start writing your article here..." }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "blog-content adm-editor-surface" } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"),
        h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }),
        ul: e.isActive("bulletList"), ol: e.isActive("orderedList"), quote: e.isActive("blockquote"),
        link: e.isActive("link"), canUndo: e.can().undo(), canRedo: e.can().redo(),
      },
  });

  if (!editor || !s) return <div className="adm-editor adm-editor-loading" />;

  const setLink = () => {
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Link address (https://...)", previous);
    if (url === null) return;
    if (url.trim() === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const addImage = async (file) => {
    if (!file) return;
    try {
      const result = await api.upload(file);
      editor.chain().focus().setImage({ src: result.url, alt: window.prompt("Describe this image (for accessibility)", "") || "" }).run();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const chain = () => editor.chain().focus();
  return (
    <div className="adm-editor">
      <div className="adm-toolbar">
        <Btn label="Heading" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></Btn>
        <Btn label="Sub-heading" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Btn>
        <span className="adm-tool-sep" />
        <Btn label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn label="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()}><Underline size={16} /></Btn>
        <span className="adm-tool-sep" />
        <Btn label="Bullet list" active={s.ul} onClick={() => chain().toggleBulletList().run()}><List size={17} /></Btn>
        <Btn label="Numbered list" active={s.ol} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={17} /></Btn>
        <Btn label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <span className="adm-tool-sep" />
        <Btn label="Add link" active={s.link} onClick={setLink}><Link2 size={16} /></Btn>
        {s.link && <Btn label="Remove link" onClick={() => chain().extendMarkRange("link").unsetLink().run()}><Unlink size={16} /></Btn>}
        <Btn label="Insert image" onClick={() => fileInput.current?.click()}><ImagePlus size={17} /></Btn>
        <Btn label="Divider line" onClick={() => chain().setHorizontalRule().run()}><Minus size={17} /></Btn>
        <span className="adm-tool-sep" />
        <Btn label="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()}><Undo2 size={16} /></Btn>
        <Btn label="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()}><Redo2 size={16} /></Btn>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => { addImage(e.target.files[0]); e.target.value = ""; }} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
