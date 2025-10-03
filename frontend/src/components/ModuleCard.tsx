interface ModuleCardProps {
  module: {
    name: string;
    description: string;
    enabled: boolean;
    commands: string[];
  };
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {module.name}
          </h3>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            module.enabled
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {module.enabled ? '✅ Enabled' : '⏸️ Disabled'}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {module.description}
        </p>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Commands ({module.commands.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {module.commands.map((command) => (
              <span
                key={command}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                /{command}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              module.enabled
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-discord-blurple hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {module.enabled ? 'Disable Module' : 'Enable Module'}
          </button>
        </div>
      </div>
    </div>
  );
}