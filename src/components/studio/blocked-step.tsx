import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";

const blocks = {
  animal: {
    title: "Choose an animal first",
    body: "Fashion Samples belong to an animal in the catalogue.",
    href: "/studio",
    action: "Choose an animal",
  },
  sample: {
    title: "Choose a Fashion Sample first",
    body: "The later steps keep the Fashion Sample you select. An unavailable sample cannot be used.",
    href: "/studio/sample",
    action: "Choose a Fashion Sample",
  },
  photo: {
    title: "Add a portrait first",
    body: "The last step uses the photograph from this visit. It stays in this browser and is not uploaded.",
    href: "/studio/photo",
    action: "Add your photograph",
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
