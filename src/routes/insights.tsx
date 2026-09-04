import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell, PageHeading, cardClass } from "@/components/app-shell";
import {
  STATUSES,
  useApplications,
  useStats,
  type Status,
} from "@/lib/applications";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "Job Search Insights — Hireflow Job Tracker" },
      {
        name: "description",
        content:
          "Conversion rates, weekly activity and top companies across your job search, calculated from your tracked applications.",
      },
      { property: "og:title", content: "Job Search Insights — Hireflow" },
      {
        property: "og:description",
        content:
          "Conversion rates, weekly activity and top companies across your job search.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const barTone: Record<Status, string> = {
  Applied: "bg-cyan",
  Interview: "bg-amber",
  Offer: "bg-violet",
  Rejected: "bg-rose",
};

function InsightsPage() {
  const { applications } = useApplications();
  const stats = useStats(applications);

  const statusBreakdown = useMemo(
    () =>
      STATUSES.map((status) => {
        const count = applications.filter((a) => a.status === status).length;
        return {
          status,
          count,
          pct: stats.total ? Math.round((count / stats.total) * 100) : 0,
        };
      }),
    [applications, stats.total],
  );

  const weekly = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const startIso = start.toISOString().slice(0, 10);
      const endIso = end.toISOString().slice(0, 10);
      const count = applications.filter(
        (a) => a.date >= startIso && a.date <= endIso,
      ).length;
      return {
        label: end.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        count,
      };
    });
    return buckets.reverse();
  }, [applications]);

  const maxWeekly = Math.max(1, ...weekly.map((w) => w.count));

  const companies = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of applications) {
      map.set(a.company, (map.get(a.company) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([company, count]) => ({ company, count }));
  }, [applications]);

  const locations = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of applications) {
      map.set(a.location, (map.get(a.location) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [applications]);

  const interviewRate = stats.total
    ? Math.round(((stats.interviews + stats.offers) / stats.total) * 100)
    : 0;
  const offerRate = stats.total
    ? Math.round((stats.offers / stats.total) * 100)
    : 0;

  return (
    <AppShell>
      <PageHeading
        title="Insights"
        subtitle={`Calculated from ${stats.total} tracked application${stats.total === 1 ? "" : "s"}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total applications", value: stats.total, tone: "text-foreground" },
          { label: "Interview rate", value: `${interviewRate}%`, tone: "text-amber" },
          { label: "Offer rate", value: `${offerRate}%`, tone: "text-violet" },
          { label: "Response rate", value: `${stats.responseRate}%`, tone: "text-cyan" },
        ].map((card) => (
          <div key={card.label} className={`${cardClass} p-5`}>
            <p className="text-mute text-xs uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`font-display font-semibold text-3xl mt-2 ${card.tone}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
          <h2 className="font-display font-semibold text-lg tracking-tight mb-5">
            Stage breakdown
          </h2>
          <div className="space-y-4">
            {statusBreakdown.map((row) => (
              <div key={row.status}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{row.status}</span>
                  <span className="text-mute">
                    {row.count} · {row.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barTone[row.status]}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
          <h2 className="font-display font-semibold text-lg tracking-tight mb-5">
            Applications per week
          </h2>
          <div className="flex items-end gap-3 h-40">
            {weekly.map((week) => (
              <div
                key={week.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs text-mute">{week.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-violet to-cyan"
                  style={{
                    height: `${Math.max(4, (week.count / maxWeekly) * 100)}%`,
                  }}
                />
                <span className="text-[10px] text-mute">{week.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
          <h2 className="font-display font-semibold text-lg tracking-tight mb-5">
            Top companies
          </h2>
          {companies.length === 0 ? (
            <p className="text-sm text-mute">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {companies.map((c) => (
                <li
                  key={c.company}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{c.company}</span>
                  <span className="text-mute">
                    {c.count} application{c.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
          <h2 className="font-display font-semibold text-lg tracking-tight mb-5">
            Where you're applying
          </h2>
          {locations.length === 0 ? (
            <p className="text-sm text-mute">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {locations.map(([location, count]) => (
                <li key={location} className="flex items-center gap-3 text-sm">
                  <span className="w-28 truncate">{location}</span>
                  <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan"
                      style={{
                        width: `${stats.total ? (count / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-mute w-6 text-right">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
