import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import { db } from "../firebase-config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "react-quill-new/dist/quill.snow.css";
import { throttle } from "lodash";
import "../App.css";

function Editor() {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const quillRef = useRef<ReactQuill>(null);

  const isLocalChange = useRef(false);

  const documentRef = doc(db, "documents", "example-doc");

  useEffect(() => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();

    // Save content to Firestore with throttle
    const saveContent = throttle(() => {
      if (quillRef.current && isLocalChange.current) {
        const content = quillRef.current.getEditor().getContents();

        console.log("Saving content to Firestore:", content);

        setDoc(
          documentRef,
          {
            content: content.ops,
          },
          {
            merge: true,
          }
        )
          .then(() => {
            console.log("Content saved successfully");
          })
          .catch((error) => {
            console.error("Error saving content:", error);
          });

        isLocalChange.current = false;
      }
    }, 1000);

    // Load initial content from Firestore
    getDoc(documentRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const savedContent = docSnap.data().content;

          if (savedContent) {
            editor.setContents(savedContent);
          }
        } else {
          console.log(
            "No document found, starting with empty editor."
          );
        }
      })
      .catch((error) => {
        console.error("Error loading document:", error);
      });

    // Listen for Firestore document updates in real time
    const unsubscribe = onSnapshot(
      documentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const newContent = snapshot.data().content;

          if (newContent && !isEditing) {
            const currentCursorPosition =
              editor.getSelection()?.index || 0;

            // Update editor without triggering text-change
            editor.setContents(newContent, "silent");

            // Restore cursor position
            editor.setSelection(currentCursorPosition, 0, "silent");
          }
        }
      },
      (error) => {
        console.error("Firestore listener error:", error);
      }
    );

    // Listen for local editor changes
    const handleTextChange = (
      _delta: unknown,
      _oldDelta: unknown,
      source: string
    ) => {
      if (source === "user") {
        isLocalChange.current = true;

        setIsEditing(true);

        saveContent();

        // Reset editing state after 5 seconds
        setTimeout(() => {
          setIsEditing(false);
        }, 5000);
      }
    };

    editor.on("text-change", handleTextChange);

    // Cleanup
    return () => {
      unsubscribe();
      editor.off("text-change", handleTextChange);
      saveContent.cancel();
    };
  }, [isEditing]);

  return (
    <div className="google-docs-editor">
      <ReactQuill ref={quillRef} />
    </div>
  );
}

export default Editor;