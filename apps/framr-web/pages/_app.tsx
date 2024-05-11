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

export default CustomApp;
