import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-[#f3f4f6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
