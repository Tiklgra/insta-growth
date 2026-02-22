"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Plus, RefreshCw, Copy, ExternalLink, Check, MessageSquare, User } from "lucide-react";
import Link from "next/link";

// Fallback UserButton component
const FallbackUserButton = () => (
  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
    <User className="w-4 h-4 text-gray-400" />
  </div>
);

// Dynamically import UserButton only on client side
const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton).catch(() => FallbackUserButton),
  { ssr: false, loading: () => <FallbackUserButton /> }
);

interface Post {
  id: string;
  accountHandle: string;
  postUrl: string;
  postCaption: string;
  postImageUrl?: string;
  suggestedComment?: string;
  status: "pending" | "generating" | "ready" | "done" | "skipped";
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [targetAccounts, setTargetAccounts] = useState<string[]>([
    "@biohackingbrittany",
    "@foundmyfitness",
  ]);
  const [newAccount, setNewAccount] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(12);
  const usageLimit = 200;
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/subscription");
        const data = await res.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error("Failed to check subscription:", error);
      } finally {
        setLoadingSubscription(false);
      }
    };
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const addAccount = () => {
    if (newAccount && !targetAccounts.includes(newAccount)) {
      const formatted = newAccount.startsWith("@") ? newAccount : `@${newAccount}`;
      setTargetAccounts([...targetAccounts, formatted]);
      setNewAccount("");
    }
  };

  const removeAccount = (account: string) => {
    setTargetAccounts(targetAccounts.filter(a => a !== account));
  };

  const copyComment = async (post: Post) => {
    if (post.suggestedComment) {
      await navigator.clipboard.writeText(post.suggestedComment);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const refreshQueue = async () => {
    setIsRefreshing(true);
    // TODO: Call API to refresh posts
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-bold text-xl text-white">InstaGrowth</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">{usageCount}</span>
              <span> / {usageLimit} comments</span>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Target Accounts */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4 text-white">Target Accounts</h2>
              <div className="space-y-2 mb-4">
                {targetAccounts.map(account => (
                  <div 
                    key={account} 
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-white">{account}</span>
                    <button 
                      onClick={() => removeAccount(account)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  placeholder="@username"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  onKeyPress={(e) => e.key === "Enter" && addAccount()}
                />
                <button 
                  onClick={addAccount}
                  className="bg-pink-600 hover:bg-pink-700 p-2 rounded-lg transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4 text-white">Usage This Month</h2>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Comments Generated</span>
                  <span>{usageCount} / {usageLimit}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(usageCount / usageLimit) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Resets on the 1st of each month
              </p>
            </div>

            {/* Subscription Status */}
            {!loadingSubscription && (
              isSubscribed ? (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                  <h2 className="font-semibold text-lg mb-2 text-white">Pro Plan Active ✓</h2>
                  <p className="text-gray-400 text-sm">
                    You have unlimited comments and premium features.
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6">
                  <h2 className="font-semibold text-lg mb-2 text-white">Upgrade to Pro</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Get unlimited comments and premium features.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 py-2 rounded-lg font-medium transition"
                  >
                    {isSubscribing ? "Loading..." : "Upgrade Now"}
                  </button>
                </div>
              )
            )}
          </div>

          {/* Main Content - Queue */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Engagement Queue</h1>
              <button 
                onClick={refreshQueue}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Queue"}
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white">No posts in queue</h3>
                <p className="text-gray-400 mb-4">
                  Add target accounts and click "Refresh Queue" to find posts to engage with.
                </p>
                <button 
                  onClick={refreshQueue}
                  className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-medium transition"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div 
                    key={post.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-pink-400">{post.accountHandle}</span>
                        <a 
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {post.postCaption}
                      </p>
                    </div>
                    {post.suggestedComment && (
                      <div className="p-4 bg-gray-800/50">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm">{post.suggestedComment}</p>
                          <button
                            onClick={() => copyComment(post)}
                            className="flex-shrink-0 p-2 hover:bg-gray-700 rounded-lg transition"
                          >
                            {copiedId === post.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
