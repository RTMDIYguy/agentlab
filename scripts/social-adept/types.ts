export type SignalSource = "reddit" | "hacker_news" | "rss" | "browserbase";

export type SignalCategory =
  | "founder_pain"
  | "tool_bloat"
  | "contrarian_debate"
  | "buying_intent"
  | "general_intel";

export interface RawSignalItem {
  id: string;
  source: SignalSource;
  sourceId: string;
  title: string;
  body: string;
  author: string;
  url: string;
  createdAt: string;
  query: string;
  hash: string;
}

export interface SignalClassification {
  category: SignalCategory;
  frictionSummary: string;
  founderVerbatim: string;
  linkedInHookIdea: string;
  roundtableAngle: string;
  actionableScore: number; // 1 - 5
  tags: string[];
}

export interface ClassifiedSignal extends RawSignalItem {
  classification: SignalClassification;
}

export interface SocialAdeptConfig {
  reddit?: {
    enabled: boolean;
    subreddits: string[];
    queries: string[];
    limit: number;
  };
  hackerNews?: {
    enabled: boolean;
    queries: string[];
    limit: number;
  };
  rss?: {
    enabled: boolean;
    feeds: Array<{
      name: string;
      url: string;
      category: string;
    }>;
  };
  filters?: {
    minScore?: number;
    excludeKeywords?: string[];
  };
}

export interface ScanRunResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  totalCollected: number;
  totalClassified: number;
  highValueCount: number;
  digestPath: string;
  signals: ClassifiedSignal[];
}
