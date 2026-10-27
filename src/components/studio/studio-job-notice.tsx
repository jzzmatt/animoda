import type { StudioJobView } from "@/studio/jobs-client";

const statusLabel: Record<StudioJobView["status"], string> = {
  pending: "Pending",
  generating: "Generating",
  completed: "Completed",
  mock_completed: "Mock completed",
  failed: "Failed",
};

export function StudioJobNotice({ job, pending }: { job: StudioJobView | null; pending: boolean }) {
  if (pending && !job) {
    return (
      <p role="status" className="font-body-md text-on-surface-variant">
        Sending the studio job…
      </p>
    );
  }
  if (!job) return null;
  return (
    <p
      role={job.status === "failed" ? "alert" : "status"}
      className="rounded-xl bg-surface-container p-space-md font-body-md text-on-surface"
    >
      <span className="font-label-md text-label-md">
        {job.label} · {statusLabel[job.status]}
      </span>
      {job.id ? <span className="mt-space-xxs block break-all font-body-sm text-body-sm text-on-surface-variant">{job.id}</span> : null}
      <span className="mt-space-xxs block">{job.message}</span>
      {job.quota ? (
        <span className="mt-space-xxs block font-body-sm text-body-sm text-on-surface-variant">
          {job.quota.remaining} of {job.quota.limit} {job.quota.kind} jobs remain for this visit. This limit is held in server memory and is not an account quota.
        </span>
      ) : null}
    </p>
  );
}
