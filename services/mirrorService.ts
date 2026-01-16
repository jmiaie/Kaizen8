import { MirrorPayload } from '../types';

const CHANNEL_NAME = 'kaizen8_mirror_channel';

class MirrorService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((payload: MirrorPayload) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    }
  }

  public broadcast(payload: MirrorPayload) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
  }

  public subscribe(callback: (payload: MirrorPayload) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(payload: MirrorPayload) {
    this.listeners.forEach(l => l(payload));
  }

  public close() {
    // We don't necessarily close the channel to allow reconnection, 
    // but we can broadcast a close event.
    this.broadcast({ type: 'CLOSE' });
  }
}

export const mirrorService = new MirrorService();