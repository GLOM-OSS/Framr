import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="manifest" href="/manifest.json" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: light)"
            content="white"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="black"
          />
          <link rel="icon" type="image/x-icon" href="/assets/favicon.png" />
          <meta
            name="description"
            content="Framr is a tool that helps you to generate ordered frames for your well drillling projects. with rules management and a lot of features."
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
