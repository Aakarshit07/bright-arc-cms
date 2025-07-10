"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

// Quill editor interface for ref
export interface QuillEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

interface QuillEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

// Global flag to prevent multiple Quill instances
let quillInstanceCounter = 0;

export const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Start writing...",
      readOnly = false,
      className,
      height = "400px",
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const instanceIdRef = useRef<number>(0);
    const [isReady, setIsReady] = useState(false);
    const initializingRef = useRef(false);

    // Assign unique instance ID
    useEffect(() => {
      instanceIdRef.current = ++quillInstanceCounter;
      console.log(`🆔 QuillEditor instance ${instanceIdRef.current} created`);
    }, []);

    const getContent = useCallback(() => {
      if (!quillRef.current) return "";
      return quillRef.current.root.innerHTML || "";
    }, []);

    const setContent = useCallback((content: string) => {
      if (!quillRef.current) return;
      const currentContent = quillRef.current.root.innerHTML;
      if (content !== currentContent) {
        quillRef.current.root.innerHTML = content;
      }
    }, []);

    const focus = useCallback(() => {
      if (quillRef.current) {
        quillRef.current.focus();
      }
    }, []);

    useImperativeHandle(ref, () => ({
      getContent,
      setContent,
      focus,
    }));

    useEffect(() => {
      // Prevent multiple initializations
      if (initializingRef.current || !editorRef.current || quillRef.current) {
        console.log(
          `⚠️ Skipping initialization for instance ${instanceIdRef.current} - already initialized or in progress`
        );
        return;
      }

      initializingRef.current = true;
      console.log(`🚀 Initializing Quill instance ${instanceIdRef.current}`);

      const initializeQuill = async () => {
        try {
          // Check if container still exists and is empty
          if (!editorRef.current) {
            console.log(
              `❌ Container not found for instance ${instanceIdRef.current}`
            );
            return;
          }

          // Clear any existing content
          editorRef.current.innerHTML = "";

          // Dynamic import
          const { default: Quill } = await import("quill");
          await import("quill/dist/quill.snow.css");

          // Double-check container is still available
          if (!editorRef.current) {
            console.log(
              `❌ Container disappeared during import for instance ${instanceIdRef.current}`
            );
            return;
          }

          // Create unique ID for this editor instance
          const editorId = `quill-editor-${
            instanceIdRef.current
          }-${Date.now()}`;
          editorRef.current.id = editorId;

          console.log(
            `📝 Creating Quill instance ${instanceIdRef.current} with ID: ${editorId}`
          );

          // Initialize Quill
          const quill = new Quill(`#${editorId}`, {
            theme: "snow",
            readOnly,
            placeholder,
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link"],
                ["clean"],
              ],
            },
          });

          // Set initial content
          if (value) {
            quill.root.innerHTML = value;
          }

          // Handle content changes
          const handleTextChange = () => {
            const content = quill.root.innerHTML;
            onChange?.(content);
          };

          quill.on("text-change", handleTextChange);

          quillRef.current = quill;
          setIsReady(true);
          initializingRef.current = false;

          console.log(
            `✅ Quill instance ${instanceIdRef.current} initialized successfully`
          );
        } catch (error) {
          console.error(
            `❌ Error initializing Quill instance ${instanceIdRef.current}:`,
            error
          );
          initializingRef.current = false;
        }
      };

      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(initializeQuill, 100);

      // Cleanup function
      return () => {
        clearTimeout(timeoutId);

        if (quillRef.current) {
          console.log(`🧹 Cleaning up Quill instance ${instanceIdRef.current}`);
          try {
            // Remove all event listeners
            quillRef.current.off("text-change");

            // Clear the editor
            if (editorRef.current) {
              editorRef.current.innerHTML = "";
            }
          } catch (error) {
            console.error(
              `Error cleaning up Quill instance ${instanceIdRef.current}:`,
              error
            );
          }

          quillRef.current = null;
        }

        setIsReady(false);
        initializingRef.current = false;
        console.log(`🗑️ Quill instance ${instanceIdRef.current} cleaned up`);
      };
    }, []); // Only run once on mount

    // Update content when value changes
    useEffect(() => {
      if (isReady && quillRef.current && value !== undefined) {
        const currentContent = quillRef.current.root.innerHTML;
        if (value !== currentContent) {
          console.log(
            `📝 Updating content for instance ${instanceIdRef.current}`
          );
          quillRef.current.root.innerHTML = value;
        }
      }
    }, [value, isReady]);

    // Update readOnly state
    useEffect(() => {
      if (isReady && quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly, isReady]);

    return (
      <div className={cn("quill-editor-wrapper", className)}>
        {!isReady && (
          <div className="flex items-center justify-center p-4 border rounded-md bg-muted/50">
            <div className="text-sm text-muted-foreground">
              Loading editor...
            </div>
          </div>
        )}
        <div
          ref={editorRef}
          style={{
            height: isReady ? height : "0px",
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
          className="bg-background border-0 rounded-md"
        />
        <style jsx global>{`
          .quill-editor-wrapper .ql-editor {
            font-size: 14px;
            line-height: 1.6;
            min-height: 200px;
          }
          .quill-editor-wrapper .ql-toolbar {
            border-top: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-bottom: none;
            border-radius: 6px 6px 0 0;
            background: hsl(var(--background));
          }
          .quill-editor-wrapper .ql-container {
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-bottom: 1px solid hsl(var(--border));
            border-top: none;
            border-radius: 0 0 6px 6px;
            background: hsl(var(--background));
          }
          .quill-editor-wrapper .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground));
            font-style: normal;
          }
          .quill-editor-wrapper .ql-toolbar .ql-stroke {
            stroke: hsl(var(--foreground));
          }
          .quill-editor-wrapper .ql-toolbar .ql-fill {
            fill: hsl(var(--foreground));
          }
          .quill-editor-wrapper .ql-toolbar .ql-picker-label {
            color: hsl(var(--foreground));
          }
        `}</style>
      </div>
    );
  }
);

QuillEditor.displayName = "QuillEditor";
