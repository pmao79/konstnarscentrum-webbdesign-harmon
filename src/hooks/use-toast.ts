
import * as React from "react";
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToastState = {
  toasts: ToasterToast[];
};

// Keeping a reference to the state instead of using useRef
let state: ToastState = {
  toasts: [],
};

const listeners = new Set<(state: ToastState) => void>();

const subscribe = (listener: (state: ToastState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const dispatch = (toast?: ToasterToast) => {
  if (toast) {
    const nextToasts = [...state.toasts];
    const existingToast = nextToasts.find((t) => t.id === toast.id);

    if (existingToast) {
      existingToast.title = toast.title;
      existingToast.description = toast.description;
      existingToast.action = toast.action;
      existingToast.className = toast.className;
    } else {
      nextToasts.push(toast);
    }

    state = {
      ...state,
      toasts: nextToasts.slice(-TOAST_LIMIT),
    };
  }

  listeners.forEach((listener) => {
    listener(state);
  });
};

const update = (id: string, toast: Partial<ToasterToast>) => {
  if (!id) return;

  const nextToasts = [...state.toasts];
  const existingToast = nextToasts.find((t) => t.id === id);

  if (existingToast) {
    Object.assign(existingToast, { ...toast, id });
    state = {
      ...state,
      toasts: nextToasts,
    };
    listeners.forEach((listener) => {
      listener(state);
    });
  }
};

export type ToastMessage = Omit<ToasterToast, "id">;

const toast = (props: ToastMessage) => {
  const id = crypto.randomUUID();
  const now = Date.now();

  const dismiss = (toastId: string) => {
    update(toastId, { open: false });
    
    setTimeout(() => {
      state = {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
      listeners.forEach((listener) => {
        listener(state);
      });
    }, 300);
  };

  const toastToDispatch = {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) {
        dismiss(id);
      }
    },
    duration: props.duration || TOAST_REMOVE_DELAY,
  };

  dispatch(toastToDispatch);

  return {
    id,
    dismiss: () => dismiss(id),
    update: (props: ToastMessage) => update(id, props),
  };
};

function useToast() {
  const [toastState, setToastState] = React.useState<ToastState>(state);

  React.useEffect(() => {
    return subscribe(setToastState);
  }, []);

  return {
    toast,
    toasts: toastState.toasts,
    dismiss: (toastId: string) => {
      const toastToUpdate = toastState.toasts.find((t) => t.id === toastId);
      if (toastToUpdate) {
        toastToUpdate.onOpenChange?.(false);
      }
    },
  };
}

export { useToast, toast };
