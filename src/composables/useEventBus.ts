import { ref } from 'vue';

type EventCallback = (...args: any[]) => void;

interface EventBus {
  on: (event: string, callback: EventCallback) => void;
  emit: (event: string, ...args: any[]) => void;
  off: (event: string, callback?: EventCallback) => void;
}

const events = ref<Record<string, EventCallback[]>>({});

export const useEventBus = (): EventBus => {
  const on = (event: string, callback: EventCallback): void => {
    if (!events.value[event]) {
      events.value[event] = [];
    }
    events.value[event].push(callback);
  };

  const emit = (event: string, ...args: any[]): void => {
    if (events.value[event]) {
      events.value[event].forEach(callback => callback(...args));
    }
  };

  const off = (event: string, callback?: EventCallback): void => {
    if (!events.value[event]) {
      return;
    }

    if (!callback) {
      events.value[event] = [];
      return;
    }

    events.value[event] = events.value[event].filter(cb => cb !== callback);
  };

  return { on, emit, off };
}; 