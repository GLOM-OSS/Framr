import { ThemeProvider } from '@mui/material';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { generateTheme } from '../lib/theme';
import './style.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={generateTheme()}>
      <Head>
        <title>Framr</title>
      </Head>
      <main className="app" style={{ height: '100svh' }}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default CustomApp;
