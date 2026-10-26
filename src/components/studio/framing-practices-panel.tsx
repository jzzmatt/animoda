import { Icon } from "@/components/ui/icon";
import { framingPractices, type FramingExample } from "@/studio/framing-practices";

export function FramingPracticesPanel() {
  return (
    <section aria-labelledby="framing-practices-title" className="@container rounded-[28px] bg-[#05392e] text-white shadow-xl">
      <header className="flex items-start gap-4 px-4 pt-5 pb-4 sm:px-5 sm:pt-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2c7560]">
          <Icon name="photo_camera" className="text-[28px] text-white" />
        </span>
        <div className="min-w-0 pt-1">
          <h2 id="framing-practices-title" className="font-sans text-[1.45rem] leading-tight font-bold tracking-tight text-white sm:text-[1.75rem]">
            Framing practices
          </h2>
          <p className="mt-1 font-sans text-sm leading-5 text-white/90">
            Follow these simple guidelines to get the best results for your Animoda look.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-3 pb-4 sm:gap-4 sm:px-4 sm:pb-5">
        {framingPractices.map((practice, index) => (
          <article key={practice.id} className="rounded-[22px] bg-[#fdfcf8] px-4 py-4 text-[#1c1c1c] sm:px-5 sm:py-5">
            <div className="grid grid-cols-1 items-center gap-4 @min-[32rem]:grid-cols-[minmax(0,1fr)_132px_132px] @min-[32rem]:gap-4">
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
              <div className="grid grid-cols-2 gap-3 @min-[32rem]:contents">
                <ExampleFigure example={practice.correct} tone="correct" label="Correct" />
                <ExampleFigure example={practice.incorrect} tone="incorrect" label="Incorrect" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
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
    <figure className="relative mx-auto w-full max-w-[210px] pt-1 pr-1 pb-3 @min-[32rem]:max-w-none">
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
