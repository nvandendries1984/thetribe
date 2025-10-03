import { Collection } from 'discord.js';
import { Module, Logger } from '../../../shared/dist/index';
import { TheTribeBot } from '../index';
import * as fs from 'fs';
import * as path from 'path';

export class ModuleManager {
  private modules: Collection<string, Module> = new Collection();

  constructor(private bot: TheTribeBot) {}

  async loadModules(): Promise<void> {
    const modulesPath = path.join(__dirname, '../../../modules');

    if (!fs.existsSync(modulesPath)) {
      Logger.warn('Modules directory not found, creating it...');
      fs.mkdirSync(modulesPath, { recursive: true });
      return;
    }

    const moduleDirectories = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    Logger.info(`Found ${moduleDirectories.length} module(s) to load`);

    for (const moduleDir of moduleDirectories) {
      try {
        const modulePath = path.join(modulesPath, moduleDir);
        const moduleIndexPath = path.join(modulePath, 'dist', 'index.js');

        if (fs.existsSync(moduleIndexPath)) {
          const moduleExport = require(moduleIndexPath);
          const module: Module = moduleExport.default || moduleExport;

          if (this.validateModule(module)) {
            await this.loadModule(module);
          }
        } else {
          Logger.warn(`Module ${moduleDir} not built. Run 'npm run build' in the module directory.`);
        }
      } catch (error) {
        Logger.error(`Failed to load module ${moduleDir}:`, error);
      }
    }
  }

  private validateModule(module: any): module is Module {
    return (
      module &&
      typeof module.name === 'string' &&
      typeof module.version === 'string' &&
      typeof module.description === 'string' &&
      module.config &&
      typeof module.config === 'object'
    );
  }

  private async loadModule(module: Module): Promise<void> {
    try {
      // Initialize module if it has an init method
      if (module.init) {
        await module.init();
      }

      // Register module commands
      if (module.commands) {
        for (const command of module.commands) {
          this.bot.commandManager.registerCommand(command);
        }
      }

      // Register module events
      if (module.events) {
        for (const event of module.events) {
          this.bot.eventManager.registerEvent(event);
        }
      }

      this.modules.set(module.name, module);
      Logger.info(`Loaded module: ${module.name} v${module.version}`);
    } catch (error) {
      Logger.error(`Failed to initialize module ${module.name}:`, error);
    }
  }

  async unloadModule(moduleName: string): Promise<boolean> {
    const module = this.modules.get(moduleName);
    if (!module) {
      return false;
    }

    try {
      // Call destroy method if exists
      if (module.destroy) {
        await module.destroy();
      }

      // Unregister commands
      if (module.commands) {
        for (const command of module.commands) {
          this.bot.commandManager.unregisterCommand(command.name);
        }
      }

      // Unregister events
      if (module.events) {
        for (const event of module.events) {
          this.bot.eventManager.unregisterEvent(event.name);
        }
      }

      this.modules.delete(moduleName);
      Logger.info(`Unloaded module: ${moduleName}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to unload module ${moduleName}:`, error);
      return false;
    }
  }

  async unloadModules(): Promise<void> {
    const moduleNames = Array.from(this.modules.keys());
    for (const moduleName of moduleNames) {
      await this.unloadModule(moduleName);
    }
  }

  getModule(name: string): Module | undefined {
    return this.modules.get(name);
  }

  getModules(): Collection<string, Module> {
    return this.modules;
  }

  isModuleLoaded(name: string): boolean {
    return this.modules.has(name);
  }
}