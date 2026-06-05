import { useEffect, useState } from 'react';
import '../styles/Toast.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: Set<(toasts: ToastMessage[]) => void> = new Set();
const toasts: Map<string, ToastMessage> = new Map();

export function addToast(message: string, type: ToastType = 'info', duration = 4000) {
  const id = `toast-${++toastId}`;
  const toast: ToastMessage = { id, message, type };
  toasts.set(id, toast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toasts.delete(id);
      notifyListeners();
    }, duration);
  }

  return id;
}

function notifyListeners() {
  const toastArray = Array.from(toasts.values());
  toastListeners.forEach((listener) => listener(toastArray));
}

export function useToasts() {
  const [toastList, setToastList] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.add(setToastList);
    return () => {
      toastListeners.delete(setToastList);
      return undefined;
    };
  }, []);

  return toastList;
}

interface Props {
  toasts: ToastMessage[];
}

export function ToastContainer({ toasts }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
