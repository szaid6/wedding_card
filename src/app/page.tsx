import Link from "next/link";
import { formatFullDate } from "@/lib/dates";
import { coupleNames } from "@/lib/invitation";
import { getInvitation, listInvitationSlugs } from "@/lib/load-invitations";

export default function Home() {
  const invitations = listInvitationSlugs()
    .map((slug) => getInvitation(slug))
    .filter((inv) => inv !== null);

  return (
    <main className="min-h-svh islamic-pattern bg-[#0f3d33] px-6 py-16 text-[#22302a]">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-display text-4xl tracking-[0.12em] text-[#e6c97e]">Invitations</h1>
        <p className="mt-3 text-center text-sm text-[#fdf8ec]/70">
          Each JSON file in <code className="rounded bg-white/10 px-1">data/invitations/</code> becomes a page.
        </p>
        <ul className="mt-10 space-y-3">
          {invitations.map((inv) => (
            <li key={inv.slug}>
              <Link
                href={`/invite/${inv.slug}`}
                className="flex items-center justify-between rounded-xl border border-[#c9a24d]/70 bg-[#fdf8ec] px-5 py-4 shadow-sm transition hover:border-[#c9a24d] hover:bg-white"
              >
                <span>
                  <span className="block font-display text-lg font-medium">{coupleNames(inv)}</span>
                  <span className="text-sm text-[#5e6b62]">
                    {formatFullDate(inv.event.date)} · {inv.template}
                  </span>
                </span>
                <span className="font-mono text-xs text-[#5e6b62]">/invite/{inv.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
