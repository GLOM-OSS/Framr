import { ThemeProvider } from '@mui/material';
import { AppProps } from 'next/app';
import Head from 'next/head';

function CustomApp({ Component, pageProps }: AppProps) {
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

export default CustomApp;
