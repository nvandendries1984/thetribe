import Link from 'next/link';
import { useRouter } from 'next/router';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Servers', href: '/servers', icon: '🏰' },
  { name: 'Modules', href: '/modules', icon: '🧩' },
  { name: 'Statistics', href: '/stats', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isActive
                      ? 'bg-discord-blurple text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Stats
            </h3>
            <div className="mt-2 space-y-1">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Status:</span> 🟢 Online
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Ping:</span> 45ms
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}