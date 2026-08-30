"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Hexagon,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Brain,
  FileText,
  Target,
  Search,
  MessageSquare,
  Lock,
  Layers,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Award,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign,
  Briefcase,
  Sliders,
  Flame,
  Code2,
  Cpu,
  Database,
  CheckCheck,
  Globe,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  BarChart3,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";

// Preset jobs for interactive simulator
const JOB_PRESETS = [
  {
    id: "fullstack",
    title: "Senior Full-Stack AI Engineer (Next.js 15 & LangGraph)",
    client: "AI SaaS Startup • San Francisco, US (Payment Verified)",
    budget: "$80 - $110 / hr",
    posted: "12m ago",
    platform: "Upwork",
    category: "Full Stack",
    description:
      "We need a top-tier engineer to build an agentic proposal copilot. Must have hands-on experience with Next.js 15 App Router, FastAPI, pgvector similarity search, and LangGraph multi-agent workflows. Please share past live demos and explain how you handle sub-second streaming.",
    detectedSkills: ["Next.js 15", "LangGraph", "FastAPI", "pgvector", "SSE Streaming"],
    matchedCaseStudy: "SaaS Multi-Agent RAG Pipeline ($12k Contract)",
    variants: {
      balanced: `Hi there,\n\nI reviewed your listing for a Senior Full-Stack AI Engineer and recognized an immediate fit with my recent work. Over the past 6+ years, I have architected high-performance web applications using Next.js 15, TypeScript, and FastAPI.\n\nIn my recent client project (an AI analytics platform), I built a LangGraph state-graph pipeline with pgvector RAG context retrieval and sub-second Server-Sent Events (SSE) token streaming. I'm ready to begin immediately and deliver scalable, test-covered code.\n\nWould you be open to a brief 10-minute call this Tuesday to review my live architecture demo?\n\nBest regards,\nAlex Rivera`,
      technical: `Hello,\n\nRegarding your requirements for Next.js 15 and LangGraph orchestration: I specialize in scalable microservices architectures combining Next.js App Router, FastAPI, and pgvector embeddings.\n\nKey Technical Highlights:\n• LangGraph state machine with cyclic human-in-the-loop validation\n• Cosine-distance vector similarity indexing with 99.4% retrieval precision\n• Resilient SSE streaming with optimistic client updates\n\nLooking forward to reviewing your API specifications.\n\nSincerely,\nAlex Rivera`,
      conversational: `Hey there!\n\nI'd love to help you build your AI SaaS platform! I have 6+ years of hands-on experience building clean, responsive apps with Next.js 15 and Python.\n\nWhat caught my eye in your post is the focus on LangGraph agents and low-latency streaming—two areas I work in daily. I communicate clearly every day with async video updates and deliver clean, production-ready code.\n\nLet's chat about your project roadmap!\n\nCheers,\nAlex Rivera`,
    },
  },
  {
    id: "mobile",
    title: "Cross-Platform Mobile Developer (Flutter / React Native)",
    client: "Fintech Scale-up • London, UK ($45k spent)",
    budget: "$6,500 Fixed Price",
    posted: "28m ago",
    platform: "Upwork",
    category: "Mobile",
    description:
      "Looking for a mobile developer to build an offline-first crypto wallet with biometric auth, push notifications, and high-frequency WebSocket charts. Clean architecture and unit testing are non-negotiable.",
    detectedSkills: ["Flutter", "React Native", "Biometric Auth", "WebSockets", "Offline Sync"],
    matchedCaseStudy: "Fintech Trading App (4.9★ on App Store)",
    variants: {
      balanced: `Hello,\n\nYour offline-first crypto wallet project aligns perfectly with my mobile engineering background. Over 5+ years, I have shipped 8 production mobile apps using Flutter and React Native with biometric security and real-time state synchronization.\n\nFor a similar fintech client, I engineered a low-latency WebSocket order book with local SQLite caching that maintained 60fps even under unstable network conditions.\n\nLet's connect for a quick demo of my past production builds.\n\nBest regards,\nAlex Rivera`,
      technical: `Hi,\n\nTechnical approach for your offline-first wallet architecture:\n• State Management: Bloc/Riverpod with strict unidirectional data flow\n• Offline Persistence: Encrypted Hive/SQLite database with conflict resolution\n• Real-Time Feeds: Reconnecting WebSocket worker isolate to prevent UI thread stutter\n\nReady to discuss your security protocols and API specs.\n\nSincerely,\nAlex Rivera`,
      conversational: `Hey!\n\nThis fintech wallet sounds like an awesome build! I've been crafting smooth 60fps mobile experiences for 5+ years and know the importance of rock-solid offline sync and security.\n\nI've already solved similar WebSocket chart challenges and would love to show you a quick video walkthrough of how we can structure the app.\n\nLooking forward to connecting!\n\nCheers,\nAlex Rivera`,
    },
  },
  {
    id: "scraper",
    title: "Python Web Scraping & Data Extraction Pipeline",
    client: "E-commerce Intelligence • Berlin, Germany",
    budget: "$4,200 Fixed Price",
    posted: "45m ago",
    platform: "Fiverr Pro",
    category: "Data & Python",
    description:
      "Need a resilient scraper system to monitor 50+ retail sites daily. Must handle Cloudflare protections, dynamic JavaScript rendering (Playwright/Scrapy), rotate residential proxies, and load clean data into PostgreSQL.",
    detectedSkills: ["Python", "Playwright", "Scrapy", "Anti-Bot Bypass", "PostgreSQL"],
    matchedCaseStudy: "Automated Price Intel Bot (2M items/day)",
    variants: {
      balanced: `Hi,\n\nI have extensive experience building enterprise-grade scraping engines that extract millions of records daily without getting blocked. I specialize in Python, Playwright, Scrapy, and anti-bot evasion strategies.\n\nIn my recent build for a retail analytics firm, I created a distributed pipeline with residential proxy rotation and automated CAPTCHA resolution that achieved a 99.2% success rate across 40+ protected domains.\n\nI can have your first batch of scrapers running within 48 hours.\n\nBest regards,\nAlex Rivera`,
      technical: `Hello,\n\nProposed Architecture for your 50+ site extraction pipeline:\n• Headless Browser Cluster: Playwright with stealth patches for Cloudflare Turnstile\n• Queue & Scheduling: Celery + Redis for distributed task distribution\n• Data Pipeline: Async asyncpg batch inserts into PostgreSQL with schema validation\n\nI can provide a working proof-of-concept for your hardest target site tomorrow.\n\nSincerely,\nAlex Rivera`,
      conversational: `Hey there!\n\nHandling 50+ protected retail sites is right up my alley. I've spent years building scrapers that bypass heavy bot protections smoothly and feed clean, deduplicated data straight into PostgreSQL.\n\nI'd love to jump on a quick call and demonstrate how my stealth scraping setup handles tough Cloudflare targets.\n\nLet's get this automated!\n\nCheers,\nAlex Rivera`,
    },
  },
];

// Freelancer testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: "Marcus Vance",
    role: "Full-Stack AI Developer",
    location: "Austin, TX",
    avatar: "MV",
    stats: "+$24,000 in 60 days",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    quote:
      "BidLens completely changed my Upwork game. Instead of spending 45 minutes on every proposal, I generate a hyper-specific, RAG-matched pitch in 5 seconds. My reply rate went from 8% to over 34%.",
    category: "Full Stack",
    stars: 5,
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Mobile App Architect",
    location: "Berlin, Germany",
    avatar: "ER",
    stats: "Closed $12k Fixed Deal",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    quote:
      "The Knowledge Base RAG feature is pure magic. It pulled my exact Flutter case study and cited the live App Store links without me having to look up anything. The client hired me within 2 hours of sending.",
    category: "Mobile",
    stars: 5,
  },
  {
    id: 3,
    name: "David Chen",
    role: "Python & Automation Specialist",
    location: "Vancouver, Canada",
    avatar: "DC",
    stats: "4.8x ROI in Month 1",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    quote:
      "I was skeptical about AI proposals because generic ChatGPT cover letters get ignored. BidLens is completely different—the LangGraph multi-variant pipeline makes it sound authentic and deeply technical.",
    category: "Data & Python",
    stars: 5,
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    role: "UI/UX & Product Designer",
    location: "London, UK",
    avatar: "SJ",
    stats: "Top Rated Plus on Upwork",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    quote:
      "The Fit Scoring system helps me skip low-probability jobs and focus all my energy on high-ticket clients where my portfolio has 90%+ match score. Worth 100x the price.",
    category: "Design",
    stars: 5,
  },
];

// Interactive FAQ items
const FAQS = [
  {
    question: "Does BidLens comply with Upwork and freelance platform rules?",
    answer:
      "Yes, 100%. BidLens acts as an intelligent writing copilot. It does not automate spam bots or violate platform APIs. You maintain complete creative control to review, edit, and send high-quality, customized proposals under your own account.",
  },
  {
    question: "How does the RAG Knowledge Base keep my confidential work private?",
    answer:
      "Your uploaded PDF case studies, resumes, and code samples are encrypted at rest using AES-256 and indexed in private, tenant-isolated vector tables with pgvector. Your documents are never shared or used to train public models.",
  },
  {
    question: "How is BidLens different from standard ChatGPT or Claude prompts?",
    answer:
      "Standard LLMs generate generic, easily detectable cover letters because they lack your portfolio context and structured extraction logic. BidLens runs a multi-agent LangGraph workflow that extracts exact client requirements, searches your real case studies, computes a 0-100 fit score, and generates 3 distinct strategic variants with zero generic fluff.",
  },
  {
    question: "Can I cancel or change my plan anytime?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time with one click from your Settings dashboard. No questions asked and no lock-in contracts.",
  },
  {
    question: "What happens if I run out of weekly proposals?",
    answer:
      "You can easily upgrade to a higher tier like Growth (100 proposals/week) or Pro VIP (Unlimited) instantly, or wait for your weekly allocation to automatically reset every Monday at 00:00 UTC.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  // Interactive Simulator State
  const [selectedJob, setSelectedJob] = useState(JOB_PRESETS[0]);
  const [tone, setTone] = useState<"balanced" | "technical" | "conversational">("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState(JOB_PRESETS[0].variants.balanced);
  const [isCopied, setIsCopied] = useState(false);
  const [liveFitScore, setLiveFitScore] = useState(94);

  // Interactive Calculator State
  const [proposalsPerWeek, setProposalsPerWeek] = useState(15);
  const [avgProjectValue, setAvgProjectValue] = useState(1800);
  const [baselineWinRate, setBaselineWinRate] = useState(8);

  // Interactive Pipeline Explorer State
  const [activePipelineStep, setActivePipelineStep] = useState(1);

  // Interactive Pricing Billing Toggle (Monthly vs Annual)
  const [isAnnual, setIsAnnual] = useState(false);

  // Interactive Testimonials Filter
  const [activeCategory, setActiveCategory] = useState("All");

  // Interactive FAQ Open State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Handle Preset Job Change with typewriter effect
  const handleSelectJob = (preset: typeof JOB_PRESETS[0]) => {
    setSelectedJob(preset);
    triggerGeneration(preset.variants[tone]);
    setLiveFitScore(Math.floor(Math.random() * 6) + 92); // 92 - 97%
  };

  // Handle Tone Change
  const handleSelectTone = (newTone: "balanced" | "technical" | "conversational") => {
    setTone(newTone);
    triggerGeneration(selectedJob.variants[newTone]);
  };

  // Trigger typewriter simulation
  const triggerGeneration = (fullText: string) => {
    setIsGenerating(true);
    setDisplayedText("");
    let currentIdx = 0;
    const chunkSize = 8;

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= fullText.length) {
        setDisplayedText(fullText);
        setIsGenerating(false);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.substring(0, currentIdx));
      }
    }, 25);
  };

  // Copy proposal to clipboard
  const handleCopyProposal = () => {
    if (!displayedText) return;
    navigator.clipboard.writeText(displayedText);
    setIsCopied(true);
    toast.success("Proposal copied to clipboard!", {
      description: "Ready to paste directly into your freelance bid application.",
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Calculate dynamic ROI values
  const currentMonthlyProposals = proposalsPerWeek * 4;
  const currentDealsWon = (currentMonthlyProposals * (baselineWinRate / 100));
  const currentMonthlyRevenue = currentDealsWon * avgProjectValue;

  // With BidLens: ~3.6x win rate multiplier (capped at 42%)
  const newWinRate = Math.min(baselineWinRate * 3.6, 42);
  const newDealsWon = (currentMonthlyProposals * (newWinRate / 100));
  const newMonthlyRevenue = newDealsWon * avgProjectValue;
  const additionalMonthlyRevenue = Math.max(0, Math.round(newMonthlyRevenue - currentMonthlyRevenue));
  const hoursSavedPerMonth = Math.round(currentMonthlyProposals * 0.45); // ~27 mins saved per proposal
  const calculatedRoi = Math.round((additionalMonthlyRevenue / 39) * 100);

  // Testimonials filter
  const filteredTestimonials =
    activeCategory === "All"
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Animated Multi-Color Glows */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] rounded-full bg-indigo-600/15 blur-[180px] pointer-events-none" />
      <div className="absolute top-80 right-10 w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none" />
      <div className="absolute top-[1600px] left-10 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[200px] pointer-events-none" />
      <div className="absolute top-[2800px] right-1/4 w-[700px] h-[700px] rounded-full bg-amber-500/10 blur-[220px] pointer-events-none" />

      {/* Modern Glassmorphic Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080B11]/85 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo
              size="lg"
              badge="AI"
              badgeClassName="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-black tracking-wider"
              textClassName="text-2xl font-black"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-400">
            <a href="#demo" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Live Demo
            </a>
            <a href="#pipeline" className="hover:text-indigo-400 transition-colors">
              LangGraph Pipeline
            </a>
            <a href="#calculator" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              ROI Calculator
            </a>
            <a href="#radar" className="hover:text-emerald-400 transition-colors">
              Job Radar
            </a>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-slate-200 transition-colors">
              Wall of Wins
            </a>
          </nav>

          {/* User Auth CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer gap-2 transition-all">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="h-10 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 cursor-pointer gap-2 transition-all hover:scale-[1.02]">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center z-10">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-8 shadow-sm backdrop-blur-md animate-fade-in hover:border-indigo-500/50 transition-all">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LangGraph Multi-Agent RAG Engine • Sub-4s Generation</span>
          <ChevronRight className="h-3 w-3 text-indigo-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
          Turn Cold Job Posts Into{" "}
          <span className="text-gradient-hero">
            High-Ticket Contracts
          </span>
        </h1>

        {/* Value Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          BidLens analyzes freelance job listings, queries your real portfolio via <span className="text-indigo-300 font-medium">pgvector semantic search</span>, and crafts 3 hyper-tailored proposal variants that get you hired.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#demo">
            <Button
              size="lg"
              className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl gap-2 shadow-2xl shadow-indigo-600/30 cursor-pointer w-full sm:w-auto hover:scale-105 transition-all"
            >
              <Zap className="h-5 w-5 fill-amber-300 text-amber-300" />
              Try Interactive Simulator
            </Button>
          </a>
          <Link href="/signup">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 hover:text-white rounded-2xl cursor-pointer w-full sm:w-auto backdrop-blur-md"
            >
              Start Free (3 Proposals/wk)
            </Button>
          </Link>
        </div>

        {/* Live Metrics Proof Tickers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">$2.8M+</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Freelancer Deals Won</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">94.8%</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Fit Match Accuracy</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">3.2s</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Avg Generation Speed</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-purple-400">4.1x</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Interview Boost</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: INTERACTIVE PROPOSAL PLAYGROUND & SIMULATOR */}
      <section id="demo" className="py-20 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-10">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs px-3 py-1 mb-3">
            ✨ Interactive Live Simulator
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience the LangGraph Agent in Action
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Select real job listings below or change tones to see how BidLens retrieves your past case studies and crafts winning proposals.
          </p>
        </div>

        {/* Simulator Container */}
        <div className="rounded-3xl border border-slate-800 bg-[#0E1422]/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Top Bar: Job Preset Selection */}
          <div className="p-5 border-b border-slate-800/90 bg-slate-900/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                Select Job Posting:
              </span>
              {JOB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectJob(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedJob.id === preset.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white"
                  }`}
                >
                  <span>{preset.category}</span>
                  <span className="text-[10px] opacity-75">({preset.budget})</span>
                </button>
              ))}
            </div>

            {/* Strategy / Tone Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-purple-400" />
                Tone:
              </span>
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                {(["balanced", "technical", "conversational"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSelectTone(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      tone === t
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulator Body (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Job Intelligence & RAG Match Context */}
            <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950/40 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    {selectedJob.platform} Listing
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {selectedJob.budget}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{selectedJob.client}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 leading-relaxed">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Job Requirement Excerpt:
                </span>
                {selectedJob.description}
              </div>

              {/* RAG Extracted Skills */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Detected Core Skills (NLP Extraction):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.detectedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Portfolio Case Study */}
              <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-purple-400" />
                    pgvector RAG Matched Case:
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px]">
                    Cosine: 0.96
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-200">{selectedJob.matchedCaseStudy}</p>
                <p className="text-[11px] text-slate-400">
                  Automatically injected verified project metrics and tech stack references.
                </p>
              </div>
            </div>

            {/* Right Column: Live AI Proposal Output */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
              {/* Output Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs">
                    {liveFitScore}%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Overall Match Fit Score
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      High Conversion Probability
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => triggerGeneration(selectedJob.variants[tone])}
                    disabled={isGenerating}
                    className="h-8 px-3 text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin text-indigo-400" : ""}`} />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyProposal}
                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg cursor-pointer gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    {isCopied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 text-white" />}
                    {isCopied ? "Copied!" : "Copy Pitch"}
                  </Button>
                </div>
              </div>

              {/* Proposal Content Box */}
              <div className="relative rounded-2xl border border-slate-800 bg-[#080B11] p-5 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line shadow-inner min-h-[300px] overflow-y-auto">
                {displayedText}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                )}
              </div>

              {/* Status Footer */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Zero Generic AI Hallucinations Guardrail Verified
                </span>
                <span className="font-mono text-slate-400">Model: GPT-4o Agent • 418 tokens</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE ROI & EARNINGS BOOSTER CALCULATOR */}
      <section id="calculator" className="py-20 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs px-3 py-1 mb-3">
            💰 Freelancer Revenue Simulator
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Calculate Your Extra Monthly Earnings
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            See how converting 3.6x more proposals directly boosts your take-home monthly freelance revenue.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#0E1422]/90 p-8 lg:p-10 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-7">
            {/* Slider 1: Proposals Per Week */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-400" />
                  Proposals Sent Per Week
                </span>
                <span className="text-indigo-400 font-mono text-base font-bold bg-indigo-500/10 px-3 py-0.5 rounded-lg border border-indigo-500/20">
                  {proposalsPerWeek} proposals / wk
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={proposalsPerWeek}
                onChange={(e) => setProposalsPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>2/wk (Casual)</span>
                <span>25/wk (Active)</span>
                <span>50/wk (Agency)</span>
              </div>
            </div>

            {/* Slider 2: Average Project Value */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Average Deal / Contract Size
                </span>
                <span className="text-emerald-400 font-mono text-base font-bold bg-emerald-500/10 px-3 py-0.5 rounded-lg border border-emerald-500/20">
                  ${avgProjectValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="8000"
                step="100"
                value={avgProjectValue}
                onChange={(e) => setAvgProjectValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>$300 (Micro Task)</span>
                <span>$3,000 (Medium Project)</span>
                <span>$8,000+ (High Ticket)</span>
              </div>
            </div>

            {/* Slider 3: Baseline Win Rate */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  Current Proposal Win Rate
                </span>
                <span className="text-amber-400 font-mono text-base font-bold bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20">
                  {baselineWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={baselineWinRate}
                onChange={(e) => setBaselineWinRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>2% (Low Reply)</span>
                <span>8% (Average)</span>
                <span>25% (Top Freelancer)</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 p-7 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-950/90 space-y-6 text-center shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Estimated Monthly Revenue Boost
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white mt-2 font-mono">
                +${additionalMonthlyRevenue.toLocaleString()}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">
                🚀 Projected Win Rate: {newWinRate.toFixed(1)}% (vs {baselineWinRate}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
                <span className="text-[11px] text-slate-400 block">Time Saved</span>
                <span className="text-lg font-bold text-white font-mono">{hoursSavedPerMonth} hrs/mo</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
                <span className="text-[11px] text-slate-400 block">Extra Contracts</span>
                <span className="text-lg font-bold text-white font-mono">
                  +{(newDealsWon - currentDealsWon).toFixed(1)} /mo
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 font-medium">
              ✨ Estimated ROI: <span className="font-bold text-white">{calculatedRoi.toLocaleString()}%</span> on BidLens Growth Plan ($39/mo)
            </div>

            <Link href="/signup">
              <Button className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-500/25">
                Unlock This Revenue Boost →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE 4-STEP LANGGRAPH PIPELINE EXPLORER */}
      <section id="pipeline" className="py-20 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-14">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs px-3 py-1 mb-3">
            🧠 State Machine Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How the LangGraph Agent Thinks
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Click each stage to inspect the deep reasoning graph that produces high-converting proposals.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { step: 1, title: "1. Job Entity Extractor", icon: Search, color: "text-blue-400" },
            { step: 2, title: "2. pgvector RAG Matcher", icon: Database, color: "text-purple-400" },
            { step: 3, title: "3. Multi-Agent Drafter", icon: Bot, color: "text-cyan-400" },
            { step: 4, title: "4. Quality Guardrail", icon: ShieldCheck, color: "text-emerald-400" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activePipelineStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActivePipelineStep(item.step)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`h-5 w-5 ${item.color} mb-2`} />
                <span className="text-xs font-bold text-white block">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Panel */}
        <div className="rounded-3xl border border-slate-800 bg-[#0E1422]/90 p-8 shadow-2xl backdrop-blur-2xl">
          {activePipelineStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-400" />
                  Phase 1: Job NLP & Constraint Extraction Node
                </h3>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                  Latency: 380ms
                </Badge>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                The agent parses the raw client post into structured schema: extracting core technical requirements, hidden constraints, budget type, client sentiment, and screening questions that must be addressed.
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-blue-300">
                {`{\n  "client_industry": "Fintech / SaaS",\n  "required_tech": ["Next.js 15", "FastAPI", "pgvector", "SSE"],\n  "hidden_pain_points": ["Sub-second streaming latency", "Zero hallucination"],\n  "estimated_budget_tier": "High ($80-$110/hr)",\n  "recommended_tone": "Technical Architect"\n}`}
              </div>
            </div>
          )}

          {activePipelineStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  Phase 2: pgvector RAG Embedding Retrieval
                </h3>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                  Latency: 240ms
                </Badge>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Computes OpenAI text-embedding-3-small vectors of extracted job requirements and executes cosine similarity searches against your private Knowledge Base documents and case studies.
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-purple-300">
                {`SELECT doc_title, excerpt, 1 - (embedding <=> job_vec) AS similarity\nFROM user_knowledge_docs\nWHERE user_id = :user_id\nORDER BY similarity DESC\nLIMIT 3;\n\n-- Match 1: "SaaS Multi-Agent RAG Pipeline" (Similarity: 0.961)\n-- Match 2: "FastAPI SSE Token Streaming Demo" (Similarity: 0.944)`}
              </div>
            </div>
          )}

          {activePipelineStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  Phase 3: Parallel Multi-Agent Draft Generation
                </h3>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                  Latency: 1,850ms
                </Badge>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Three specialized sub-agents draft concurrently using different strategic angles: Balanced High-Converting, Deep Technical System Architect, and Conversational Relationship-First.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
                  <span className="font-bold text-blue-300 block mb-1">Variant A: Balanced</span>
                  <span className="text-slate-300">Focuses on ROI, past metrics, and immediate availability.</span>
                </div>
                <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-xs">
                  <span className="font-bold text-purple-300 block mb-1">Variant B: Technical</span>
                  <span className="text-slate-300">Emphasizes architecture diagrams, stack trade-offs, and specs.</span>
                </div>
                <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-xs">
                  <span className="font-bold text-cyan-300 block mb-1">Variant C: Conversational</span>
                  <span className="text-slate-300">Casual, friendly tone with live async video offer.</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Phase 4: Guardrail Verification & Fit Scorer
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  Latency: 420ms
                </Badge>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Runs an automated validation step to ensure no invented claims or hallucinations were introduced, checks that all specific questions in the job post were answered, and computes the 0-100 Match Fit Score.
              </p>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-300">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Passed 12 Security & Quality Guardrails
                </span>
                <span className="font-mono bg-emerald-950/80 px-2 py-1 rounded text-emerald-200">
                  Computed Fit Score: 94.8%
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: SIMULATED REAL-TIME JOB RADAR FEED */}
      <section id="radar" className="py-20 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 mb-3">
            📡 Live Opportunity Radar
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            High-Ticket Jobs Auto-Scored For You
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            BidLens automatically scans incoming freelance feeds and matches your profile in real time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Senior Next.js 15 & AI Agent Lead",
              budget: "$95/hr",
              client: "US • 100% Hire Rate ($120k spent)",
              fitScore: 98,
              badge: "🔥 98% Match (High Win Chance)",
              badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              category: "Next.js & AI",
            },
            {
              title: "FastAPI & pgvector Vector Search Dev",
              budget: "$5,200 Fixed",
              client: "UK • Verified Payment ($38k spent)",
              fitScore: 95,
              badge: "✨ 95% Match (Case Study Matched)",
              badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
              category: "Backend & RAG",
            },
            {
              title: "Flutter Crypto Wallet Mobile App",
              budget: "$7,000 Fixed",
              client: "Canada • 5.0★ Rating",
              fitScore: 91,
              badge: "🎯 91% Match (Strong Portfolio)",
              badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
              category: "Mobile App",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-800 bg-[#0E1422]/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{item.category}</span>
                  <span className="text-xs font-bold text-emerald-400">{item.budget}</span>
                </div>
                <h4 className="text-base font-bold text-white leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.client}</p>
                <div className="mt-3">
                  <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${item.badgeClass}`}>
                    {item.badge}
                  </Badge>
                </div>
              </div>

              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs border-slate-700 text-slate-200 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white rounded-xl cursor-pointer transition-all gap-1"
                >
                  <span>Auto-Draft Pitch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: DISTINCT MULTI-COLOR PRICING CARDS */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs px-3 py-1 mb-3">
            💎 Multi-Color Pricing Plans
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Choose the plan that matches your freelance proposal volume. Upgrade or cancel anytime.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl border border-slate-800 bg-[#0E1422]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isAnnual
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isAnnual
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                Save 20% + 2 Mo Free
              </span>
            </button>
          </div>
        </div>

        {/* 4 Multi-Colored Tier Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* TIER 1: FREE PLAN (Emerald / Slate Accent) */}
          <div className="tier-card-free rounded-3xl border p-7 flex flex-col justify-between transition-all backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                  Free Tier
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Starter
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-black text-white font-mono">$0</div>
                <span className="text-xs text-slate-400">Free forever • No card required</span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Essential proposal generation for solo freelancers getting started.
              </p>

              <div className="my-6 border-t border-emerald-500/20" />

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>3 Proposals</strong> per week</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>1 Freelance Profile</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>5 Chat Revisions per job</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Standard GPT-4o Mini Engine</span>
                </li>
              </ul>
            </div>

            <Link href="/signup" className="mt-8">
              <Button
                variant="outline"
                className="w-full h-11 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* TIER 2: STARTER PLAN (Solar Amber / Orange Accent) */}
          <div className="tier-card-starter rounded-3xl border p-7 flex flex-col justify-between transition-all backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                  Starter Plan
                </span>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                  Active
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-black text-white font-mono">
                  ${isAnnual ? "15" : "19"}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
                <span className="text-xs text-amber-400/80">
                  {isAnnual ? "Billed $180 annually (Save $48)" : "Billed monthly"}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                For active freelancers applying regularly on Upwork and Fiverr.
              </p>

              <div className="my-6 border-t border-amber-500/20" />

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span><strong>25 Proposals</strong> per week</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>3 Specialized Profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>5 Knowledge Base PDF Docs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Deep Fit Match Scoring</span>
                </li>
              </ul>
            </div>

            <Link href="/signup" className="mt-8">
              <Button
                variant="outline"
                className="w-full h-11 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Choose Starter
              </Button>
            </Link>
          </div>

          {/* TIER 3: GROWTH PLAN (Radiant Indigo / Violet / Purple Accent — MOST POPULAR) */}
          <div className="tier-card-growth rounded-3xl p-7 flex flex-col justify-between transition-all backdrop-blur-xl relative scale-105 shadow-2xl">
            {/* Most Popular Floating Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-white" />
                Most Popular
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-purple-300">
                  Growth Plan
                </span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                  High Volume
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-black text-white font-mono">
                  ${isAnnual ? "31" : "39"}
                  <span className="text-xs font-normal text-slate-300"> /mo</span>
                </div>
                <span className="text-xs text-purple-300">
                  {isAnnual ? "Billed $372 annually (Save $96)" : "Billed monthly"}
                </span>
              </div>

              <p className="text-xs text-slate-200 mt-3 leading-relaxed">
                For busy full-time freelancers and contractor leads who want maximum win rates.
              </p>

              <div className="my-6 border-t border-purple-500/30" />

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span><strong>100 Proposals</strong> per week</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>10 Specialized Profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span><strong>Unlimited</strong> Knowledge Base RAG</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Priority LangGraph GPT-4o</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>3 Variant Generation simultaneously</span>
                </li>
              </ul>
            </div>

            <Link href="/signup" className="mt-8">
              <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-purple-500/30">
                Start Growth Plan →
              </Button>
            </Link>
          </div>

          {/* TIER 4: PRO VIP PLAN (Cyber Cyan & Sky Blue Accent) */}
          <div className="tier-card-vip rounded-3xl border p-7 flex flex-col justify-between transition-all backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-400">
                  Pro VIP Agency
                </span>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                  Power
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-black text-white font-mono">
                  ${isAnnual ? "119" : "149"}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
                <span className="text-xs text-cyan-400/80">
                  {isAnnual ? "Billed $1,428 annually (Save $360)" : "Billed monthly"}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                For agencies, lead gen teams, and power bidders needing unlimited throughput.
              </p>

              <div className="my-6 border-t border-cyan-500/20" />

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span><strong>Unlimited Proposals</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Unlimited Profiles & RAG Docs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Multi-Seat Agency Team Access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Custom Agent Prompt Fine-Tuning</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>24/7 Dedicated Support Lead</span>
                </li>
              </ul>
            </div>

            <Link href="/signup" className="mt-8">
              <Button
                variant="outline"
                className="w-full h-11 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Choose Pro VIP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: WALL OF WINS / TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 mb-3">
            🏆 Real Freelancer Results
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Wall of Wins
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Join thousands of developers, designers, and consultants winning high-ticket contracts.
          </p>

          {/* Role Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["All", "Full Stack", "Mobile", "Data & Python", "Design"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="p-7 rounded-3xl border border-slate-800 bg-[#0E1422]/90 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.name}</h4>
                      <p className="text-xs text-slate-400">
                        {t.role} • {t.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <Badge className={`text-xs font-bold px-2.5 py-0.5 ${t.badgeColor}`}>
                  {t.stats}
                </Badge>
                <span className="text-[11px] text-slate-400">Verified Freelancer</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE FAQ ACCORDION */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs px-3 py-1 mb-3">
            <HelpCircle className="h-3.5 w-3.5 inline mr-1" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-[#0E1422]/90 backdrop-blur-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 bg-slate-950/40 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL HIGH-CONVERSION CTA BANNER */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-950/90 via-[#0E1422] to-purple-950/90 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Ready to Win More Freelance Deals?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Generate tailored proposals in seconds with real portfolio RAG context. Start for free today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black rounded-2xl gap-2 shadow-2xl shadow-indigo-600/30 cursor-pointer w-full sm:w-auto hover:scale-105 transition-all"
              >
                <Zap className="h-5 w-5 fill-white" />
                Claim Your Free Account (3 Proposals/wk)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#06080D] py-14 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              badge="AI"
              badgeClassName="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] font-bold"
              href="/"
            />
          </div>

          {/* System Status Ticker */}
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All AI Pipelines Operational • 99.98% Uptime</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pipeline" className="hover:text-white transition-colors">LangGraph Pipeline</a>
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link
              href="/admin/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1 border-l border-slate-800 pl-4"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
