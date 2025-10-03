import { Module } from '../../../shared/dist/index';
import { pingCommand, serverInfoCommand, userInfoCommand } from './commands';

const generalModule: Module = {
  name: 'general',
  version: '1.0.0',
  description: 'General purpose commands for basic bot functionality',
  config: {
    name: 'general',
    version: '1.0.0',
    description: 'General purpose commands for basic bot functionality',
    enabled: true,
    permissions: [],
    settings: {},
  },
  commands: [
    pingCommand,
    serverInfoCommand,
    userInfoCommand,
  ],
};

export default generalModule;