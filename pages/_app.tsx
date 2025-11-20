"use client";
import type { AppProps } from 'next/app';
import { TodoProvider } from '../context/TodoContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TodoProvider>
      <Component {...pageProps} />
    </TodoProvider>
  );
}
