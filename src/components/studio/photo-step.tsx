"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { photoRejection } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";
import { FramingPracticesDialog } from "./framing-practices-dialog";

type PhotoIntent = "camera" | "upload" | "drop";

async function compressPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("canvas");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function PhotoStep() {
  const studio = useStudio();
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [guidance, setGuidance] = useState<PhotoIntent | null>(null);
  const droppedFile = useRef<File | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  async function acceptFile(file: File | undefined) {
    if (!file) return;
    const rejection = photoRejection(file);
    if (rejection) {
      setError(rejection);
      return;
    }
    setPreparing(true);
    setError(null);
    try {
      const dataUrl = await compressPhoto(file);
      studio.setPhoto({ dataUrl, name: file.name || "portrait.jpg" });
      stream?.getTracks().forEach((track) => track.stop());
      setStream(null);
    } catch {
      setError("This browser could not prepare that photograph. Try a smaller JPG or PNG.");
    } finally {
      setPreparing(false);
    }
  }

  async function openCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser did not open a camera. Upload a photograph instead.");
      return;
    }
    try {
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      stream?.getTracks().forEach((track) => track.stop());
      setStream(next);
    } catch {
      setError("The camera did not open. You can upload a photograph instead.");
    }
  }

  function requestGuidance(intent: PhotoIntent, file?: File) {
    droppedFile.current = intent === "drop" ? (file ?? null) : null;
    setGuidance(intent);
  }

  function cancelGuidance() {
    droppedFile.current = null;
    setGuidance(null);
  }

  function confirmGuidance() {
    const intent = guidance;
    const file = droppedFile.current;
    droppedFile.current = null;
    setGuidance(null);
    if (intent === "upload") {
      uploadRef.current?.click();
      return;
    }
    if (intent === "drop") {
      void acceptFile(file ?? undefined);
      return;
    }
    void openCamera();
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError("The camera has no frame yet. Wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("This browser could not keep that camera frame. Upload a photograph instead.");
      return;
    }
    context.drawImage(video, 0, 0);
    studio.setPhoto({ dataUrl: canvas.toDataURL("image/jpeg", 0.86), name: "camera-portrait.jpg" });
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-surface-container px-space-sm py-space-xxs font-label-caps text-label-caps tracking-widest text-secondary uppercase">
          <span className="h-2 w-2 rounded-full bg-golden-accent" />
          Step 1 of 5 · Personal atelier
        </p>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          Add your portrait
        </h1>
        <p className="mt-space-xs max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          Upload a clear photograph or take one with your camera. Animoda keeps it in this browser for the visit. It is not uploaded, and it is not measured.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-7">
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-xl">
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-surface-container">
              {stream ? (
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              ) : studio.photoDataUrl ? (
                // The portrait is a data URL from this visit, which next/image does not serve.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={studio.photoDataUrl} alt="Your portrait for this studio visit" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-space-xs px-space-lg text-center">
                  <Icon name="portrait" className="text-[40px] text-secondary" />
                  <p className="font-title-md text-title-md text-primary">No portrait yet</p>
                  <p className="max-w-xs font-body-sm text-body-sm text-on-surface-variant">
                    The frame stays empty until you add a photograph.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-xs">
              <div className="flex flex-wrap gap-space-xs">
                {stream ? (
                  <button
                    type="button"
                    onClick={captureFrame}
                    className="inline-flex min-h-11 items-center gap-space-xxs rounded-full bg-primary-container px-space-md font-label-md text-label-md text-on-primary"
                  >
                    <Icon name="photo_camera" className="text-[18px]" />
                    Capture
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => requestGuidance("upload")}
                  className="inline-flex min-h-11 items-center gap-space-xxs rounded-full bg-surface-container px-space-md font-label-md text-label-md text-on-surface"
                >
                  <Icon name="sync_alt" className="text-[18px]" />
                  {studio.photoDataUrl ? "Replace photo" : "Upload"}
                </button>
              </div>
              {studio.photoDataUrl ? (
                <button
                  type="button"
                  onClick={() => studio.clearPhoto()}
                  className="inline-flex min-h-11 items-center gap-space-xxs rounded-full px-space-sm font-label-sm text-label-sm text-error hover:bg-error-container"
                >
                  <Icon name="delete" className="text-[16px]" />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex items-start gap-space-sm rounded-xl bg-surface-container p-space-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
              <Icon name="lock" fill className="text-[20px]" />
            </span>
            <div>
              <h2 className="font-title-md text-title-md text-primary">Portrait stays in this browser</h2>
              <p className="mt-space-xxs font-body-sm text-body-sm text-on-surface-variant">
                Animoda does not upload the file, sell it, or place it in a public catalogue. An account gallery is a later phase. Leaving this browser can clear the visit.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-lg lg:col-span-5">
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-xl shadow-md">
            <div>
              <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Select method</p>
              <h2 className="font-headline-sm text-headline-sm text-primary">Provide your likeness</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Choose how you would like to begin this visit.</p>
            </div>
            <button
              type="button"
              onClick={() => requestGuidance("camera")}
              className="flex min-h-11 items-start gap-space-md rounded-xl bg-surface-container-low p-space-md text-left hover:bg-surface-container"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-golden-accent">
                <Icon name="photo_camera" className="text-[24px]" />
              </span>
              <span>
                <span className="block font-title-md text-title-md font-bold text-primary">Take a photo</span>
                <span className="mt-space-xxs block font-body-sm text-body-sm text-on-surface-variant">
                  Opens the camera if this browser allows it.
                </span>
              </span>
            </button>
            <div
              className="flex cursor-pointer flex-col items-center rounded-xl bg-surface p-space-lg text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                requestGuidance("drop", event.dataTransfer.files[0]);
              }}
              onClick={() => requestGuidance("upload")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  requestGuidance("upload");
                }
              }}
              role="button"
              tabIndex={0}
            >
              <Icon name="upload_file" className="text-[28px] text-primary" />
              <h3 className="mt-space-xs font-title-md text-title-md text-primary">Upload from device</h3>
              <p className="mt-space-xxs max-w-xs font-body-sm text-body-sm text-on-surface-variant">
                Drop a photograph here, or browse files.
              </p>
              <span className="mt-space-xs rounded-full bg-surface-container px-space-sm py-space-xxs font-label-sm text-label-sm text-on-surface-variant">
                JPG, PNG, or WebP up to 25MB
              </span>
            </div>
            <input
              ref={uploadRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                void acceptFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {preparing ? <p role="status">Preparing the photograph…</p> : null}
            {error ? (
              <p role="alert" className="font-body-sm text-body-sm text-error">
                {error}
              </p>
            ) : null}
            {studio.photoName ? (
              <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
                Portrait ready: {studio.photoName}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md">
            <h2 className="font-title-md text-title-md text-primary">Framing practices</h2>
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
              Review stance, light, framing, and gaze before a photograph is captured or uploaded.
            </p>
            <button
              type="button"
              onClick={() => requestGuidance("camera")}
              className="mt-space-md inline-flex min-h-11 items-center gap-space-xxs rounded-full bg-surface-container px-space-md font-label-md text-label-md text-on-surface"
            >
              <Icon name="photo_camera" className="text-[18px]" />
              Open framing practices
            </button>
          </section>
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm sm:flex-row sm:items-center">
        <Button href="/" variant="tonal">
          Cancel studio
        </Button>
        {studio.photoDataUrl ? (
          <Button href="/studio/animal" icon="arrow_forward" iconPosition="end">
            Continue to animal selection
          </Button>
        ) : (
          <Button disabled>Continue to animal selection</Button>
        )}
      </div>
      <FramingPracticesDialog open={guidance !== null} onCancel={cancelGuidance} onTakePhoto={confirmGuidance} />
    </div>
  );
}
