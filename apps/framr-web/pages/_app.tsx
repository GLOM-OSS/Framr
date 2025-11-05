import { ThemeProvider } from '@mui/material';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { generateTheme } from '../lib/theme';

function CustomApp({ Component, pageProps }: AppProps) {
  useEffect((): void => {
    registerServiceWorker();
  }, []);
  return (
    <ThemeProvider theme={generateTheme()}>
      <Head>
        <title>Framr</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

async function registerServiceWorker() {
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
}

export default CustomApp;
