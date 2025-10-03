import useSWR from 'swr';

interface Module {
  name: string;
  version?: string;
  description: string;
  enabled: boolean;
  commands: string[];
  settings?: Record<string, any>;
}

interface ApiResponse {
  success: boolean;
  data: Module[];
  error?: string;
}

const fetcher = async (url: string): Promise<Module[]> => {
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch modules');
  }

  const data: ApiResponse = await response.json();

  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error || 'Failed to fetch modules');
  }
};

export function useModules() {
  const { data: modules, error, isLoading, mutate } = useSWR('/api/modules', fetcher, {
    revalidateOnFocus: false,
  });

  const toggleModule = async (moduleName: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/modules/${moduleName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle module');
      }

      // Optimistically update the data and then revalidate
      await mutate();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    modules: modules || [],
    isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
    toggleModule,
  };
}