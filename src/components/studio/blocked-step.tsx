import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";

const blocks = {
  photo: {
    title: "Add a portrait first",
    body: "The later steps use the photograph from this visit. It stays in this browser until a try-on request, and it is not published.",
    href: "/studio",
    action: "Go to your photograph",
  },
  animal: {
    title: "Choose an animal first",
    body: "Sample directions come from a species in the catalogue.",
    href: "/studio/animal",
    action: "Choose an animal",
  },
  suggestions: {
    title: "Select a design first",
    body: "The try-on step keeps the design you select. Choose one sample direction before continuing.",
    href: "/studio/suggestions",
    action: "Review sample directions",
  },
} as const;

export function BlockedStep({ needed }: { needed: keyof typeof blocks }) {
  const block = blocks[needed];
  return (
    <section className={cn("mx-auto flex w-full max-w-3xl flex-col gap-space-md py-space-2xl", pageGutter)}>
      <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Studio</p>
      <h1 className="font-headline-lg text-headline-lg text-primary">{block.title}</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant">{block.body}</p>
      <div>
        <Button href={block.href}>{block.action}</Button>
      </div>
      <Link href="/studio" className="font-label-md text-label-md text-secondary">
        Return to the first step
      </Link>
    </section>
  );
}
