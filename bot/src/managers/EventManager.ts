import { DiscordEvent, Logger } from '../../../shared/dist/index';
import { TheTribeBot } from '../index';

export class EventManager {
  private events: Map<string, DiscordEvent[]> = new Map();

  constructor(private bot: TheTribeBot) {}

  registerEvent(event: DiscordEvent): void {
    if (!this.events.has(event.name)) {
      this.events.set(event.name, []);
    }

    this.events.get(event.name)!.push(event);

    if (event.once) {
      this.bot.client.once(event.name, (...args) => event.execute(...args));
    } else {
      this.bot.client.on(event.name, (...args) => event.execute(...args));
    }

    Logger.debug(`Registered event: ${event.name}`);
  }

  unregisterEvent(eventName: string): boolean {
    if (this.events.has(eventName)) {
      const events = this.events.get(eventName)!;

      // Remove all listeners for this event name
      this.bot.client.removeAllListeners(eventName);

      // Re-register other events with the same name (if any)
      events.forEach((event, index) => {
        if (index > 0) { // Skip the first one as we're removing it
          if (event.once) {
            this.bot.client.once(event.name, (...args) => event.execute(...args));
          } else {
            this.bot.client.on(event.name, (...args) => event.execute(...args));
          }
        }
      });

      this.events.delete(eventName);
      Logger.debug(`Unregistered event: ${eventName}`);
      return true;
    }
    return false;
  }

  getEvents(): Map<string, DiscordEvent[]> {
    return this.events;
  }

  hasEvent(eventName: string): boolean {
    return this.events.has(eventName);
  }
}