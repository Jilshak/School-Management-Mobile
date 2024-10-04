import { create } from 'zustand';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EventStore {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (updatedEvent: Event) => void;
  deleteEvent: (eventId: string) => void;
}

const useEventStore = create<EventStore>((set) => ({
  events: [],
  
  setEvents: (events) => set({ events }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map((event) => 
      event._id === updatedEvent._id ? updatedEvent : event
    )
  })),
  
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter((event) => event._id !== eventId)
  })),
}));

export default useEventStore;
