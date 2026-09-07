export type Role = 'buyer' | 'seller' | 'advertiser' | 'admin';

export interface Question {
  text: string;
  options: string[];
  correct: number;
  topic: string;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: number; // minutes
  description: string;
  questions: Question[];
  sellerEmail: string;
  sellerName: string;
  rating: number;
  ratingCount: number;
  createdAt: number;
  unitsSold?: number;
  gross?: number;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  testIds: string[];
  sellerEmail: string;
  sellerName: string;
  createdAt: number;
  unitsSold?: number;
  gross?: number;
}

export interface Purchase {
  id: string;
  testId: string;
  buyerEmail: string;
  price: number;
  paymentId: string | null;
  ts: number;
}

export interface BundlePurchase {
  id: string;
  bundleId: string;
  buyerEmail: string;
  price: number;
  paymentId: string | null;
  ts: number;
}

export interface TopicStat {
  correct: number;
  total: number;
}

export interface Attempt {
  id: string;
  testId: string;
  buyerEmail: string;
  score: number;
  total: number;
  answers: Record<number, number>;
  topicMap: Record<string, TopicStat>;
  timeTakenSeconds: number;
  ts: number;
  ratingGiven: number | null;
}

export interface Session {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  referralCode?: string;
  referralRewards?: { id: string; ts: number; used: boolean; fromBuyerName: string }[];
  emailVerified?: boolean;
}

export interface ReferralData {
  referralCode: string;
  referredCount: number;
  rewards: { id: string; ts: number; used: boolean; fromBuyerName: string }[];
}

export interface Ad {
  id: string;
  advertiserEmail: string;
  advertiserName: string;
  headline: string;
  body: string;
  placement: string;
  days: number;
  cost: number;
  startTs: number;
  endTs: number;
}
