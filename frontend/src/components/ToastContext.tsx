import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number; // ms, default 4000
}

interface ToastContextValue {
    addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

// ── Context ───────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ addToast: () => { } });

// ── Event bridge (for non-React code like Axios interceptor) ──────
type ToastEventPayload = { message: string; variant: ToastVariant; duration?: number };
const TOAST_EVENT = 'app:toast';

/** Call this anywhere outside React to fire a toast */
export function emitToast(message: string, variant: ToastVariant = 'info', duration?: number) {
    window.dispatchEvent(
        new CustomEvent<ToastEventPayload>(TOAST_EVENT, { detail: { message, variant, duration } })
    );
}

// ── Provider ──────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) { clearTimeout(timer); timers.current.delete(id); }
    }, []);

    const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, variant, duration }]);
        const timer = setTimeout(() => removeToast(id), duration);
        timers.current.set(id, timer);
    }, [removeToast]);

    // Listen for events from outside React (e.g. Axios interceptor)
    useEffect(() => {
        const handler = (e: Event) => {
            const { message, variant, duration } = (e as CustomEvent<ToastEventPayload>).detail;
            addToast(message, variant, duration);
        };
        window.addEventListener(TOAST_EVENT, handler);
        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
};

// ── Hook ─────────────────────────────────────────────────────────
export const useToast = () => useContext(ToastContext);

// ── Icons per variant ─────────────────────────────────────────────
const variantIcon: Record<ToastVariant, string> = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

// ── ToastContainer ────────────────────────────────────────────────
const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
    if (toasts.length === 0) return null;
    return (
        <div className="toast-container-custom" role="region" aria-label="Notifications">
            {toasts.map(t => (
                <div key={t.id} className={`toast-item toast-${t.variant}`} role="alert">
                    <span className="toast-icon">{variantIcon[t.variant]}</span>
                    <span className="toast-message">{t.message}</span>
                    <button className="toast-close" onClick={() => onClose(t.id)} aria-label="Dismiss">✕</button>
                </div>
            ))}
        </div>
    );
};
