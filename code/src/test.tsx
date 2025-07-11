import { useRef, useState } from "react";
import GridOverlay from "./GridOverlay";

/** convert an HTTPS image to base-64 entirely in the browser */
export async function httpsToBase64(url: string): Promise<{ mime: string; b64: string }> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);

  const blob = await res.blob();                // binary
  const mime = blob.type || "image/jpeg";

  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1]); // remove data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return { mime, b64 };        // plain base-64, no Buffer needed
}

async function fileToBase64(file: File): Promise<{ mime: string; b64: string }> {
  const mime = file.type || "image/jpeg";

  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);                         // <-- File, not Blob
  });

  return { mime, b64 };
}

// --- helper ---------------------------------------------------------------
function dataURLtoBase64(dataURL: string) {
  return dataURL.split(",")[1]; // removes "data:image/png;base64,"
}

/* ---------- minimal React demo ---------- */
export default function ImagePicker(props: {
  setB64ForAI: (b64: string) => void;
}) {
  const [imgURL, setImgURL] = useState<string | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  /* 1. user picks file → object URL */
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectURL = URL.createObjectURL(file);
    setImgURL(objectURL);

    // tidy up old URL to avoid memory leaks
    return () => URL.revokeObjectURL(objectURL);
  }

  /* 2. grab composite PNG from the GridOverlay’s internal off-screen merge */
  async function handleSend() {
    if (!overlayRef.current) return;

    // GridOverlay stores the overlay canvas in a ref; we merge here:
    const baseImage = document.querySelector<HTMLImageElement>("#raw-image");
    if (!baseImage) return;

    const off = document.createElement("canvas");
    off.width  = baseImage.naturalWidth;
    off.height = baseImage.naturalHeight;
    const ctx = off.getContext("2d")!;
    ctx.drawImage(baseImage, 0, 0);
    ctx.drawImage(overlayRef.current, 0, 0);

    let qualityReduction = 0.8 // start with 80% quality
    let dataURL = off.toDataURL("image/jpeg", qualityReduction); // 80% quality
    // if the dataURL is too large, reduce quality until acceptable
    console.log("Initial dataURL size:", dataURL.length);
    while (dataURL.length > 100000 && qualityReduction > 0.1) {
      qualityReduction -= 0.1; // reduce quality by 10% each iteration
      dataURL = off.toDataURL("image/jpeg", qualityReduction);
    }
    if (qualityReduction <= 0.1) {
      console.warn("Image could not be reduced to under 1MB, consider using a smaller image.");
      return; // stop code
    }

    const b64 = dataURLtoBase64(dataURL);
    console.log("Ready for Vision model:", b64.slice(0, 40) + "…");
    props.setB64ForAI(b64); // pass to parent
    // ───────────── upload b64 to your VLM endpoint here ─────────────
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 960 }}>
      <h1>Landing-Zone Grid Demo</h1>

      {/* file chooser */}
      <input type="file" accept="image/*" onChange={handleFile} />

      {/* once a file is chosen, show the overlay component */}
      {imgURL && (
        <>
          <GridOverlay
            imageSrc={imgURL}
            rows={10}
            cols={10}
            // expose the overlay canvas so App can composite later
            refOverlay={overlayRef}
          />

          <button style={{ marginTop: 16 }} onClick={handleSend}>
            Send composite to Vision model
          </button>
        </>
      )}
    </main>
  );
}
