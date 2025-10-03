import useSWR from 'swr';

interface Stats {
  guilds: number;
  users: number;
  commands: number;
  uptime: string;
  version?: string;
  memory?: {
    used: string;
    total: string;
  };
  modules?: {
    loaded: number;
    available: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: Stats;
  error?: string;
}

const fetcher = async (url: string): Promise<Stats> => {
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  const data: ApiResponse = await response.json();

  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error || 'Failed to fetch stats');
  }
};

export function useStats() {
  const { data: stats, error, isLoading, mutate } = useSWR('/api/stats', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
  });

  return {
    stats: stats || null,
    isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}