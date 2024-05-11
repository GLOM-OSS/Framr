import { ThemeProvider } from '@mui/material';
import { InstallPWAContextProvider } from '@usePWA';
import { AppProps } from 'next/app';
import Head from 'next/head';
import AppLayout from '../lib/layouts/AppLayout';
import { generateTheme } from '../lib/theme';
import './style.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <InstallPWAContextProvider
      component={'banner'}
      installPromptTimeout={30000}
    >
      <ThemeProvider theme={generateTheme()}>
        <Head>
          <title>Framr</title>
        </Head>
        <main className="app" style={{ height: '100svh' }}>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </main>
      </ThemeProvider>
    </InstallPWAContextProvider>
  );
}

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
        }
      );
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();

export default CustomApp;
