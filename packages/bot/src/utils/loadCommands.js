import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

export default async function loadCommands(client) {
  const commandsPath = join(process.cwd(), 'src', 'commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const fileUrl = pathToFileURL(join(commandsPath, file)).href;
    const command = await import(fileUrl);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}
