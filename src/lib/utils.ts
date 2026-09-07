import type { Attempt, Test } from './types';

export function computeStreakDays(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => new Date(a.ts).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Today counts only if there's an attempt today; otherwise start counting from yesterday
  // so a still-open streak doesn't look broken just because today hasn't happened yet.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function lastAttempt(attempts: Attempt[]): Attempt | null {
  if (attempts.length === 0) return null;
  return [...attempts].sort((a, b) => b.ts - a.ts)[0];
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function formatClock(secondsLeft: number): string {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const day = 86400000;
  if (diff < day) return 'today';
  const days = Math.floor(diff / day);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export interface SellerSummary {
  sellerEmail: string;
  sellerName: string;
  testCount: number;
  avgRating: number;
  ratingCount: number;
}

export function sellerSummaries(tests: Test[]): SellerSummary[] {
  const map = new Map<string, SellerSummary>();
  for (const t of tests) {
    const existing = map.get(t.sellerEmail);
    if (existing) {
      existing.testCount += 1;
      existing.avgRating = (existing.avgRating * existing.ratingCount + t.rating * t.ratingCount) / Math.max(1, existing.ratingCount + t.ratingCount);
      existing.ratingCount += t.ratingCount;
    } else {
      map.set(t.sellerEmail, {
        sellerEmail: t.sellerEmail,
        sellerName: t.sellerName,
        testCount: 1,
        avgRating: t.rating,
        ratingCount: t.ratingCount,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.testCount - a.testCount);
}

export function topicBreakdown(test: Test): { topic: string; count: number }[] {
  const map = new Map<string, number>();
  for (const q of test.questions) {
    const topic = q.topic || 'General';
    map.set(topic, (map.get(topic) || 0) + 1);
  }
  return Array.from(map.entries()).map(([topic, count]) => ({ topic, count }));
}
