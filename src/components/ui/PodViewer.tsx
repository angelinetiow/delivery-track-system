import type { ProofOfDelivery } from "@/data/types";

export function PodViewer({ pod }: { pod: ProofOfDelivery }) {
  return (
    <div className="space-y-4">
      {pod.signatureStatus === "captured" && pod.signatureImageUrl ? (
        <div>
          <a
            href={pod.signatureImageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block overflow-hidden rounded-lg border border-border bg-white p-2"
          >
            <img
              src={pod.signatureImageUrl}
              alt="Captured signature"
              className="mx-auto h-auto max-h-20 w-auto max-w-[min(100%,12rem)] object-contain"
            />
          </a>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-amber-900">
          No on-device signature — verify using photos and staff identification per SOP.
        </p>
      )}

      {pod.photoUrls.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium text-text-muted">Photo evidence</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {pod.photoUrls.map((url, i) => (
              <a
                key={url + i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-lg border border-border bg-slate-50"
              >
                <img
                  src={url}
                  alt={`Proof photo ${i + 1}`}
                  className="aspect-video w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {pod.notesFromDriver ? (
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text">Driver notes: </span>
          {pod.notesFromDriver}
        </p>
      ) : null}
    </div>
  );
}
