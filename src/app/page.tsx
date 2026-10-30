import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { formatFullDate } from "@/lib/dates";
import { coupleNames } from "@/lib/invitation";
import { getInvitation } from "@/lib/load-invitations";

const SLUG = "zaid-zikra";

function loadInvitation() {
  const invitation = getInvitation(SLUG);
  if (!invitation) notFound();
  return invitation;
}

export async function generateMetadata(): Promise<Metadata> {
  const inv = loadInvitation();
  const title = inv.seo?.title ?? `${coupleNames(inv)} - Wedding Invitation`;
  const description =
    inv.seo?.description ??
    `You're invited to celebrate with ${coupleNames(inv)} on ${formatFullDate(inv.event.date)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-svh bg-[#0f3d33]" />}>
      <Invitation />
    </Suspense>
  );
}

function Invitation() {
  return <InvitationView invitation={loadInvitation()} />;
}
