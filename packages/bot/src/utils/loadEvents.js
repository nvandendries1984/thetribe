import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

export default async function loadEvents(client) {
  const eventsPath = join(process.cwd(), 'src', 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const fileUrl = pathToFileURL(join(eventsPath, file)).href;
    const event = await import(fileUrl);
    if (event.name && event.execute) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
}
