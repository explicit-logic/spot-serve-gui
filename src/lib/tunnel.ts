import { invoke } from '@tauri-apps/api/core';
import { type Event, type UnlistenFn, listen } from '@tauri-apps/api/event';

// Types for the tunnel status and events
export interface TunnelStatus {
  is_running: boolean;
  current_url: string | null;
  current_port: number | null;
}

export interface TunnelEvents {
  tunnel_out: string;
  tunnel_err: string;
  tunnel_started: string;
  tunnel_terminated: string;
}

export type TunnelEventName = keyof TunnelEvents;

/**
 * Class to manage the tunnel operations and event handling
 */
export class TunnelManager {
  private eventUnlisteners: Map<TunnelEventName, UnlistenFn> = new Map();
  private eventHandlers: Map<TunnelEventName, ((data: any) => void)[]> =
    new Map();

  /**
   * Starts the tunnel with the specified port
   * @param port The port number to use for the tunnel
   * @returns Promise<string> The tunnel URL
   */
  async startTunnel(port: number): Promise<string> {
    try {
      return await invoke<string>('start_tunnel', { port: Number(port) });
    } catch (error) {
      throw new Error(`Failed to start tunnel: ${error}`);
    }
  }

  /**
   * Stops the currently running tunnel
   * @returns Promise<void>
   */
  async stopTunnel(): Promise<void> {
    try {
      await invoke('stop_tunnel');
    } catch (error) {
      throw new Error(`Failed to stop tunnel: ${error}`);
    }
  }

  /**
   * Restarts the tunnel with the current port configuration
   * @returns Promise<string> The new tunnel URL
   */
  async restartTunnel(): Promise<string> {
    try {
      return await invoke<string>('restart_tunnel');
    } catch (error) {
      throw new Error(`Failed to restart tunnel: ${error}`);
    }
  }

  /**
   * Gets the current status of the tunnel
   * @returns Promise<TunnelStatus>
   */
  async getTunnelStatus(): Promise<TunnelStatus> {
    try {
      return await invoke<TunnelStatus>('get_tunnel_status');
    } catch (error) {
      throw new Error(`Failed to get tunnel status: ${error}`);
    }
  }

  /**
   * Adds an event listener for tunnel events
   * @param event The event name to listen for
   * @param handler The handler function for the event
   */
  async addEventListener<T extends TunnelEventName>(
    event: T,
    handler: (data: TunnelEvents[T]) => void,
  ): Promise<void> {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);

      const unlistenFn = await listen(event, (event: Event<string>) => {
        const handlers = this.eventHandlers.get(event.event as TunnelEventName);
        if (handlers) {
          handlers.forEach((h) => h(event.payload));
        }
      });

      this.eventUnlisteners.set(event, unlistenFn);
    }

    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Removes an event listener for tunnel events
   * @param event The event name to remove the listener from
   * @param handler The handler function to remove
   */
  removeEventListener<T extends TunnelEventName>(
    event: T,
    handler: (data: TunnelEvents[T]) => void,
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }

      if (handlers.length === 0) {
        this.eventHandlers.delete(event);
        const unlistenFn = this.eventUnlisteners.get(event);
        if (unlistenFn) {
          unlistenFn();
          this.eventUnlisteners.delete(event);
        }
      }
    }
  }

  /**
   * Removes all event listeners
   */
  async cleanup(): Promise<void> {
    for (const [event, unlistenFn] of this.eventUnlisteners) {
      await unlistenFn();
      this.eventHandlers.delete(event);
    }
    this.eventUnlisteners.clear();
  }
}

// Export a singleton instance for easy usage
export const tunnelManager = new TunnelManager();
