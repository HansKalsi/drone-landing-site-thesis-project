import { useEffect, useRef, useState } from "react";
import GridOverlay from "./GridOverlay";

/* ---------- minimal React demo ---------- */
export default function ImagePicker(props: {
  setB64ForAI: (b64: string) => void;
  soleCellToKeep?: string;
  cellsToExclude?: string[];
}) {
  const [imgURL, setImgURL] = useState<string | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

  /* 1. user picks file → object URL */
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectURL = URL.createObjectURL(file);
    setImgURL(objectURL);

    // tidy up old URL to avoid memory leaks
    return () => URL.revokeObjectURL(objectURL);
  }

  // convert data URL to base-64 string
  function dataURLtoBase64(dataURL: string) {
    return dataURL.split(",")[1]; // removes "data:image/png;base64,"
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
    console.log("overlayRef", overlayRef.current);
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

  useEffect(() => {
    if (props.soleCellToKeep) {
      console.log("Sole cell to keep triggered:", props.soleCellToKeep);
      handleSend(); // auto-update if a cell is specified
    }
    if (props.cellsToExclude && props.cellsToExclude.length > 0) {
      console.log("Cells to exclude triggered:", props.cellsToExclude);
      handleSend(); // auto-update if cells to exclude are specified
    }
  }, [props.soleCellToKeep, props.cellsToExclude]);

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
            onlyKeepCell={props.soleCellToKeep ? props.soleCellToKeep : undefined}
            cellsToExclude={props.cellsToExclude ? props.cellsToExclude : []}
          />

          <button style={{ marginTop: 16 }} onClick={handleSend}>
            Send composite to Vision model
          </button>
        </>
      )}
    </main>
  );
}
