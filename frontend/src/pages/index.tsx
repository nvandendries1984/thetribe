import { useState } from 'react';
import Head from 'next/head';
import { StatsCard } from '@/components/StatsCard';
import { ModuleCard } from '@/components/ModuleCard';

export default function Home() {
  const [stats] = useState({
    guilds: 5,
    users: 1250,
    commands: 15,
    uptime: '2d 14h 32m 15s',
  });

  const [modules] = useState([
    {
      name: 'General',
      description: 'Basic bot commands like ping, serverinfo',
      enabled: true,
      commands: ['ping', 'serverinfo', 'userinfo'],
    },
    {
      name: 'Moderation',
      description: 'Moderation tools for server management',
      enabled: false,
      commands: ['kick', 'ban', 'mute', 'warn'],
    },
    {
      name: 'Music',
      description: 'Play music in voice channels',
      enabled: false,
      commands: ['play', 'stop', 'pause', 'skip'],
    },
  ]);

  return (
    <>
      <Head>
        <title>TheTribe Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Welcome to TheTribe bot management dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Servers"
            value={stats.guilds.toString()}
            icon="🏰"
            trend="+2 this week"
          />
          <StatsCard
            title="Users"
            value={stats.users.toLocaleString()}
            icon="👥"
            trend="+125 this week"
          />
          <StatsCard
            title="Commands"
            value={stats.commands.toString()}
            icon="⚡"
            trend="Available"
          />
          <StatsCard
            title="Uptime"
            value={stats.uptime}
            icon="🕐"
            trend="Running smooth"
          />
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bot Modules
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard key={module.name} module={module} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}