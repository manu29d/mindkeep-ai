"use client";
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { TodoProvider } from '../context/TodoContext';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <TodoProvider>
        <Component {...pageProps} />
      </TodoProvider>
    </SessionProvider>
  );
}
