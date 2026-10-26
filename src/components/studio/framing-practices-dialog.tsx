"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { framingPractices, type FramingExample } from "@/studio/framing-practices";

type FramingPracticesDialogProps = {
  open: boolean;
  onCancel: () => void;
  onTakePhoto: () => void;
};

export function FramingPracticesDialog({ open, onCancel, onTakePhoto }: FramingPracticesDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(onCancel);

  useEffect(() => {
    cancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = dialogRef.current;
    root?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelRef.current();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>("button:not([disabled])")];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#01281f] px-3 py-3 sm:px-6 sm:py-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="framing-practices-title"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-5xl flex-col rounded-[28px] bg-[#05392e] text-white shadow-2xl outline-none"
      >
        <header className="flex items-start gap-4 px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2c7560]">
            <Icon name="photo_camera" className="text-[28px] text-white" />
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <h2 id="framing-practices-title" className="font-sans text-[1.45rem] leading-tight font-bold tracking-tight text-white sm:text-[2rem]">
              Framing practices
            </h2>
            <p className="mt-1 max-w-2xl font-sans text-sm leading-5 text-white/90 sm:text-[15px]">
              Follow these simple guidelines to get the best results for your Animoda look.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close framing practices"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <Icon name="close" className="text-[26px]" />
          </button>
        </header>

        <div className="flex flex-col gap-3 px-3 pb-3 sm:gap-4 sm:px-5 sm:pb-4">
          {framingPractices.map((practice, index) => (
            <article key={practice.id} className="rounded-[22px] bg-[#fdfcf8] px-4 py-4 text-[#1c1c1c] sm:px-5 sm:py-5">
              <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_168px_168px] lg:gap-5">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8e470c] font-sans text-base font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-sans text-lg leading-6 font-bold text-[#1a1a1a]">{practice.title}</h3>
                    <p className="mt-0.5 font-sans text-sm leading-5 text-[#5e6662]">{practice.description}</p>
                    <ul className="mt-2.5 flex flex-col gap-1">
                      {practice.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2 font-sans text-sm leading-5 text-[#24302b]">
                          <CheckMark />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:contents">
                  <ExampleFigure example={practice.correct} tone="correct" label="Correct" />
                  <ExampleFigure example={practice.incorrect} tone="incorrect" label="Incorrect" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="grid grid-cols-2 gap-3 px-4 pt-2 pb-5 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-xl bg-[#f6f5ef] px-4 font-sans text-base font-semibold text-[#1c1c1c]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onTakePhoto}
            className="min-h-12 rounded-xl bg-[#014639] px-4 font-sans text-base font-semibold text-white"
          >
            Take a Photo
          </button>
        </footer>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#128a4e]">
      <path
        d="M3.2 8.3 6.3 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExampleFigure({
  example,
  tone,
  label,
}: {
  example: FramingExample;
  tone: "correct" | "incorrect";
  label: "Correct" | "Incorrect";
}) {
  const correct = tone === "correct";
  return (
    <figure className="relative mx-auto w-full max-w-[210px] pt-1 pr-1 pb-3 lg:max-w-none">
      <div
        className={
          correct
            ? "overflow-hidden rounded-2xl border-2 border-[#149a58]"
            : "overflow-hidden rounded-2xl border-2 border-[#e24b4b]"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={example.src} alt={example.alt} className="aspect-[3/4] w-full object-cover object-center" />
      </div>
      <span
        className={
          correct
            ? "absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#128a4e] text-white shadow-sm"
            : "absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#e24b4b] text-white shadow-sm"
        }
      >
        <Icon name={correct ? "check" : "close"} className="text-[18px]" />
      </span>
      <span
        className={
          correct
            ? "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[#018758] px-3 py-0.5 font-sans text-xs font-semibold text-white"
            : "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[#fed4cc] px-3 py-0.5 font-sans text-xs font-semibold text-[#c4312e]"
        }
      >
        {label}
      </span>
    </figure>
  );
}
