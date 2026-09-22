import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(undefined);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, message } | null
  const timeoutRef = useRef(null);

  const showToast = useCallback((message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id: Date.now(), message });
    timeoutRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        // key={toast.id} forces a remount (and thus a fresh entrance
        // animation) if a second toast fires while one is already showing.
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="animate-fade-up fixed right-4 top-20 z-[100] max-w-xs rounded-lg border border-gold/30 bg-card px-4 py-3 shadow-2xl sm:right-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-gold via-accent-purple to-accent-blue" />
            <p className="text-sm font-medium text-heading">{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
