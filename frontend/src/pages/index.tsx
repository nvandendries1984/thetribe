import { useState } from 'react';
import Head from 'next/head';
import { StatsCard } from '@/components/StatsCard';
import { ModuleCard } from '@/components/ModuleCard';
import { useStats } from '@/hooks/useStats';
import { useModules } from '@/hooks/useModules';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/hooks/useToast';

export default function Home() {
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStats();
  const { modules, isLoading: modulesLoading, error: modulesError, toggleModule } = useModules();
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleModuleToggle = async (moduleName: string, enabled: boolean) => {
    try {
      setTogglingModule(moduleName);
      await toggleModule(moduleName, enabled);

      addToast({
        type: 'success',
        message: `Module "${moduleName}" ${enabled ? 'enabled' : 'disabled'} successfully!`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to toggle module:', error);

      addToast({
        type: 'error',
        message: `Failed to ${enabled ? 'enable' : 'disable'} module "${moduleName}". Please try again.`,
        duration: 5000,
      });
    } finally {
      setTogglingModule(null);
    }
  };

  // Show loading state
  if (statsLoading || modulesLoading) {
    return (
      <>
        <Head>
          <title>TheTribe Dashboard</title>
        </Head>
        <LoadingSkeleton />
      </>
    );
  }

  // Show error state
  if (statsError || modulesError) {
    return (
      <>
        <Head>
          <title>TheTribe Dashboard - Error</title>
        </Head>
        <ErrorState
          error={statsError || modulesError || 'Unknown error'}
          onRetry={() => {
            refetchStats();
            // refetchModules(); // This will be called automatically in useModules
          }}
        />
      </>
    );
  }

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
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Servers"
              value={stats.guilds.toString()}
              icon="🏰"
              trend={`${stats.guilds} active`}
            />
            <StatsCard
              title="Users"
              value={stats.users.toLocaleString()}
              icon="👥"
              trend="Total members"
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
        )}

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bot Modules
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.name}
                module={module}
                onToggle={handleModuleToggle}
                isTogglingModule={togglingModule}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}