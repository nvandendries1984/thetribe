import { z } from 'zod';

// Guild Configuration Schema
export const guildConfigSchema = z.object({
  guildId: z.string(),
  name: z.string(),
  prefix: z.string().default('!'),
  modules: z.record(z.string(), z.boolean()).default({}),
  settings: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type GuildConfig = z.infer<typeof guildConfigSchema>;

// User Data Schema
export const userDataSchema = z.object({
  userId: z.string(),
  guildId: z.string(),
  username: z.string(),
  data: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserData = z.infer<typeof userDataSchema>;

// Module Configuration Schema
export const moduleConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  enabled: z.boolean().default(true),
  permissions: z.array(z.bigint()).default([]),
  settings: z.record(z.string(), z.unknown()).default({}),
});

export type ModuleConfig = z.infer<typeof moduleConfigSchema>;

// API Response Types
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Discord Event Types
export interface DiscordEvent {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
}

// Command Interface
export interface Command {
  name: string;
  description: string;
  permissions?: bigint[];
  cooldown?: number;
  guildOnly?: boolean;
  execute: (interaction: any, ...args: any[]) => Promise<void> | void;
}

// Module Interface
export interface Module {
  name: string;
  version: string;
  description: string;
  commands?: Command[];
  events?: DiscordEvent[];
  config: ModuleConfig;
  init?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
}