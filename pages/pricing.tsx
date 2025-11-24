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
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Demo-only pricing — no real payments required.</p>

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
                <td className="p-4 font-medium">Price</td>
                <td className="p-4 text-center">$0</td>
                <td className="p-4 text-center">$9 / user / mo*</td>
                <td className="p-4 text-center">Custom</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">AI Task Breakdowns</td>
                <td className="p-4 text-center">10 / month</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited + SLA</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Boards / Projects</td>
                <td className="p-4 text-center">Up to 3</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">Team Members</td>
                <td className="p-4 text-center">1</td>
                <td className="p-4 text-center">Up to 10</td>
                <td className="p-4 text-center">Custom</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Phases (Enterprise feature)</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">Included</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">Attachments</td>
                <td className="p-4 text-center">Up to 50MB total</td>
                <td className="p-4 text-center">Up to 1GB total</td>
                <td className="p-4 text-center">Custom storage</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Priority Support</td>
                <td className="p-4 text-center">Community</td>
                <td className="p-4 text-center">Email</td>
                <td className="p-4 text-center">Phone & Email</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium">SSO / SAML</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">Supported</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Custom Branding</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center">Included</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">*This is a demo project. No real payment is collected. Pro pricing shown for demonstration purposes only.</p>

        <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
          <Link href="/auth/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">Start Free</Link>
          <Link href="/auth/signup" className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg text-gray-800 dark:text-white">Try Pro (demo)</Link>
          <Link href="/pages/contact" className="ml-0 md:ml-4 text-sm text-gray-500">Contact Sales</Link>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} MindKeep AI. Demo pricing only.</div>
      </footer>
    </div>
  );
}
