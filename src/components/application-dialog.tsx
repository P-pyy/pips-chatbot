import { useEffect, useState } from "react";

import {
  COLORS,
  STATUSES,
  type Application,
  type Status,
} from "@/lib/applications";
import {
  ghostButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/app-shell";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  role: "",
  company: "",
  location: "",
  type: "Full-time",
  status: "Applied" as Status,
  salary: "",
  date: today(),
  notes: "",
});

export function ApplicationDialog({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<Application, "id">) => void;
  initial?: Application | null;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) {
      setForm({
        role: initial.role,
        company: initial.company,
        location: initial.location,
        type: initial.type,
        status: initial.status,
        salary: initial.salary,
        date: initial.date,
        notes: initial.notes,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, initial]);

  if (!open) return null;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) {
      setError("Role and company are required.");
      return;
    }
    onSave({
      role: form.role.trim(),
      company: form.company.trim(),
      location: form.location.trim() || "Remote",
      type: form.type.trim() || "Full-time",
      status: form.status,
      salary: form.salary.trim() || "—",
      date: form.date || today(),
      notes: form.notes.trim(),
      color:
        initial?.color ??
        COLORS[Math.floor(Math.random() * COLORS.length)] ??
        "cyan",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-8 rounded-3xl border border-line bg-frost/90 backdrop-blur-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-xl tracking-tight">
          {initial ? "Edit application" : "Add application"}
        </h2>
        <p className="text-sm text-mute mt-1">
          {initial
            ? "Update the details of this role."
            : "Log a new role you have applied for."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className={labelClass} htmlFor="role">
              Role
            </label>
            <input
              id="role"
              className={inputClass}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="company">
              Company
            </label>
            <input
              id="company"
              className={inputClass}
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Nimbus Labs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass} htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className={inputClass}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Remote"
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass} htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className={inputClass}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {["Full-time", "Part-time", "Contract", "Hybrid", "On-site", "Internship"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className={inputClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass} htmlFor="salary">
                Salary
              </label>
              <input
                id="salary"
                className={inputClass}
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="$150k"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="date">
              Date applied
            </label>
            <input
              id="date"
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className={inputClass}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Recruiter contact, next steps…"
            />
          </div>

          {error ? <p className="text-xs text-rose">{error}</p> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={ghostButtonClass}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              {initial ? "Save changes" : "Save application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
