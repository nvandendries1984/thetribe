import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Space_Grotesk } from 'next/font/google';
import { SWRConfig } from 'swr';
import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/hooks/useToast';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={spaceGrotesk.className}>
      <SWRConfig
        value={{
          errorRetryCount: 3,
          errorRetryInterval: 1000,
          dedupingInterval: 10000,
        }}
      >
        <ToastProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ToastProvider>
      </SWRConfig>
    </div>
  );
}