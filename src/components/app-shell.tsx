import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { AccentColor, Status } from "@/lib/applications";

const navItems = [
  { to: "/", label: "Pipeline" },
  { to: "/applications", label: "Applications" },
  { to: "/calendar", label: "Calendar" },
  { to: "/insights", label: "Insights" },
] as const;

export function AppShell({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-ink text-foreground font-body relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-violet/40 blur-[140px]" />
        <div className="absolute top-24 right-0 h-[460px] w-[460px] rounded-full bg-cyan/30 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[520px] rounded-full bg-rose/25 blur-[150px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-5 md:px-10 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan to-violet grid place-items-center font-display font-bold text-ink text-lg">
              H
            </div>
            <div>
              <p className="font-display font-semibold text-[15px] leading-none tracking-tight">
                Hireflow
              </p>
              <p className="text-[11px] text-mute mt-1">Job Tracker</p>
            </div>
          </Link>

          <nav className="order-3 md:order-none w-full md:w-auto flex items-center gap-1 text-sm text-mute overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "px-4 py-2 rounded-full bg-foreground/10 text-foreground font-medium whitespace-nowrap",
                }}
                inactiveProps={{
                  className:
                    "px-4 py-2 rounded-full hover:text-foreground transition whitespace-nowrap",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {actions}
            <div className="size-9 rounded-full bg-gradient-to-br from-rose to-violet grid place-items-center text-sm font-semibold text-foreground">
              AR
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">
          {title}
        </h1>
        <p className="text-mute text-sm mt-2">{subtitle}</p>
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

const statusTone: Record<Status, string> = {
  Applied: "bg-cyan/15 text-cyan",
  Interview: "bg-amber/15 text-amber",
  Offer: "bg-violet/15 text-violet",
  Rejected: "bg-rose/15 text-rose",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusTone[status]}`}
    >
      {status}
    </span>
  );
}

const avatarTone: Record<AccentColor, string> = {
  cyan: "bg-cyan/15 text-cyan",
  violet: "bg-violet/15 text-violet",
  rose: "bg-rose/15 text-rose",
  amber: "bg-amber/15 text-amber",
};

export function Avatar({
  initials,
  color,
}: {
  initials: string;
  color: AccentColor;
}) {
  return (
    <div
      className={`size-9 shrink-0 rounded-lg grid place-items-center text-xs font-semibold ${avatarTone[color]}`}
    >
      {initials}
    </div>
  );
}

export const cardClass =
  "rounded-2xl border border-line bg-frost/50 backdrop-blur-xl";

export const primaryButtonClass =
  "text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-cyan to-violet text-ink hover:opacity-90 transition";

export const ghostButtonClass =
  "text-sm font-medium px-4 py-2 rounded-lg border border-line bg-foreground/5 hover:bg-foreground/10 transition";

export const inputClass =
  "w-full rounded-xl border border-line bg-ink/60 px-3 py-2 text-sm text-foreground placeholder:text-mute/60 focus:border-cyan focus:outline-none";

export const labelClass =
  "text-xs font-medium text-mute uppercase tracking-wider";
