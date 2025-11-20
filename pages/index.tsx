import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Layout, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">MindKeep AI</div>
        <div className="space-x-4">
          <Link href="/auth/signin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
            Log In
          </Link>
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Organize your life with <span className="text-blue-600 dark:text-blue-400">AI-Powered</span> Clarity
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          MindKeep AI combines Kanban boards, smart task breakdowns, and AI assistance to help you achieve more with less stress.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-transform transform hover:scale-105 flex items-center">
            Get Started Free <ArrowRight className="ml-2" size={20} />
          </Link>
          <Link href="#features" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Learn More
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-800/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why MindKeep AI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="text-blue-500" size={40} />}
              title="Smart Kanban Boards"
              description="Visualize your workflow with intuitive boards that adapt to your project's needs."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" size={40} />}
              title="AI Task Breakdown"
              description="Overwhelmed? Let our AI break down complex tasks into actionable steps instantly."
            />
            <FeatureCard 
              icon={<Shield className="text-green-500" size={40} />}
              title="Secure & Private"
              description="Your data is encrypted and safe. Focus on your work, we'll handle the security."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} MindKeep AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
