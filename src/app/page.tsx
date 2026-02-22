import Link from "next/link";
import { Sparkles, MessageSquare, TrendingUp, Shield } from "lucide-react";

// Dynamic import for Clerk components (only load if configured)
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

// Fallback components when Clerk is not configured
const SignedIn = isClerkConfigured 
  ? require("@clerk/nextjs").SignedIn 
  : ({ children }: { children: React.ReactNode }) => null;
const SignedOut = isClerkConfigured 
  ? require("@clerk/nextjs").SignedOut 
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;
const UserButton = isClerkConfigured 
  ? require("@clerk/nextjs").UserButton 
  : () => null;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-bold text-xl">InstaGrowth</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="text-gray-400 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-pink-400">AI-Powered Engagement</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Grow Your Instagram<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            With Authentic Engagement
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Generate thoughtful, personalized comments for your target accounts. 
          Build real connections and grow your audience authentically.
        </p>
        <div className="flex items-center justify-center gap-4">
          <SignedOut>
            <Link 
              href="/sign-up" 
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing" 
              className="border border-gray-700 hover:border-gray-600 px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              View Pricing
            </Link>
          </SignedOut>
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Comment Suggestions</h3>
            <p className="text-gray-400">
              Get personalized comment suggestions that match your voice and resonate with your audience.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Target Account Curation</h3>
            <p className="text-gray-400">
              Find and curate posts from accounts in your niche to engage with strategically.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Authentic Growth</h3>
            <p className="text-gray-400">
              Build genuine connections with thoughtful comments — no spam, no bots, just real engagement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your Instagram?</h2>
          <p className="text-gray-400 mb-6">
            Start your free trial today. No credit card required.
          </p>
          <SignedOut>
            <Link 
              href="/sign-up" 
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-semibold text-lg transition inline-block"
            >
              Get Started Free
            </Link>
          </SignedOut>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 InstaGrowth. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
