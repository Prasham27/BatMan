// Server-side, in-memory analytics accumulator.
// Persists for the lifetime of the server process. On Vercel Hobby this
// means roughly until the next cold start (~15 min idle). For durable
// tracking, swap the module-level state for Vercel KV / Upstash Redis.

export interface TrackEvent {
  timestamp: number;
  path: string;
  ua: string;
  ip?: string;
  referrer?: string;
  sessionId?: string;
  visitorId?: string;
}

export interface PathHit {
  path: string;
  timestamp: number;
  sessionId?: string;
}

export interface VisitorRecord {
  visitorId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number; // distinct sessions for this visitor
  totalHits: number; // total page hits across sessions
  sessionIds: string[];
  paths: PathHit[]; // most recent first
  ua?: string;
}

const MAX_EVENTS = 500;
const MAX_PATHS_PER_VISITOR = 60;
const MAX_VISITORS = 500;

const events: TrackEvent[] = [];
const pageHits = new Map<string, number>();
const sessions = new Set<string>();
const visitors = new Map<string, VisitorRecord>();
let totalHits = 0;
let firstHitAt: number | null = null;

const SERVER_BOOT = Date.now();

export function record(event: TrackEvent): void {
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.pop();
  pageHits.set(event.path, (pageHits.get(event.path) ?? 0) + 1);
  if (event.sessionId) sessions.add(event.sessionId);
  totalHits += 1;
  if (firstHitAt === null) firstHitAt = event.timestamp;

  if (event.visitorId) {
    let v = visitors.get(event.visitorId);
    if (!v) {
      // Evict oldest visitor if at cap
      if (visitors.size >= MAX_VISITORS) {
        let oldestId: string | null = null;
        let oldestSeen = Infinity;
        for (const [id, rec] of visitors.entries()) {
          if (rec.lastSeenAt < oldestSeen) {
            oldestSeen = rec.lastSeenAt;
            oldestId = id;
          }
        }
        if (oldestId) visitors.delete(oldestId);
      }
      v = {
        visitorId: event.visitorId,
        firstSeenAt: event.timestamp,
        lastSeenAt: event.timestamp,
        visitCount: 0,
        totalHits: 0,
        sessionIds: [],
        paths: [],
        ua: event.ua,
      };
      visitors.set(event.visitorId, v);
    }

    v.lastSeenAt = event.timestamp;
    v.totalHits += 1;
    if (event.sessionId && !v.sessionIds.includes(event.sessionId)) {
      v.sessionIds.push(event.sessionId);
      v.visitCount += 1;
    }
    if (v.sessionIds.length === 0) {
      // Treat first hit (no session id) as a visit
      v.visitCount = Math.max(v.visitCount, 1);
    }
    v.paths.unshift({
      path: event.path,
      timestamp: event.timestamp,
      sessionId: event.sessionId,
    });
    if (v.paths.length > MAX_PATHS_PER_VISITOR) v.paths.pop();
    if (event.ua) v.ua = event.ua;
  }
}

export interface AnalyticsSummary {
  totalHits: number;
  uniqueSessions: number;
  uniqueVisitors: number;
  topPages: { path: string; hits: number }[];
  recentEvents: TrackEvent[];
  visitors: VisitorRecord[];
  snapshotAt: string;
  firstHitAt: string | null;
  serverUptimeMs: number;
}

export function summary(eventLimit = 50, visitorLimit = 100): AnalyticsSummary {
  const topPages = Array.from(pageHits.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([path, hits]) => ({ path, hits }));

  const visitorList = Array.from(visitors.values())
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
    .slice(0, visitorLimit);

  return {
    totalHits,
    uniqueSessions: sessions.size,
    uniqueVisitors: visitors.size,
    topPages,
    recentEvents: events.slice(0, eventLimit),
    visitors: visitorList,
    snapshotAt: new Date().toISOString(),
    firstHitAt: firstHitAt ? new Date(firstHitAt).toISOString() : null,
    serverUptimeMs: Date.now() - SERVER_BOOT,
  };
}
