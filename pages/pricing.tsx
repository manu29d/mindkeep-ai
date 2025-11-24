import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">MindKeep AI</h1>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Home</Link>
          <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Sign Up</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-extrabold text-center mb-4">Pricing</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Demo — feature availability only. No prices or purchase actions are shown.</p>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-4 border-b"></th>
                <th className="p-4 border-b text-center">Free</th>
                <th className="p-4 border-b text-center">Pro</th>
                <th className="p-4 border-b text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-medium">Smart Kanban Boards</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">AI Task Breakdowns (Gemini)</td>
                <td className="p-4 text-center">Limited / Demo</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Task Timers</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">Sub-todos (Nested Tasks)</td>
                <td className="p-4 text-center">Limited</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Teams & Invitations</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">Basic</td>
                <td className="p-4 text-center">Full</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">Auth (Sign up / Sign in)</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
                <td className="p-4 text-center">Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} MindKeep AI. Demo pricing only.</div>
      </footer>
    </div>
  );
}
