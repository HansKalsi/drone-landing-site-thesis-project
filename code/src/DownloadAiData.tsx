/**
 *  - downloads <frameId>.png   – decoded image
 *  - downloads <frameId>.json – landing-site metadata
 *
 * @param {string}        dataUrl    full data-URL (image/png or image/jpeg)
 * @param {string}        frameId    unique image ID (used in filenames)
 * @param {Array<Object>} top3Cells  [{row, col, score}, …]
 * @param {Object}        extras     optional extra fields for the JSON
 */
export async function saveScenario(dataUrl: string, frameId: string, top3Cells: Array<Object>, extras: Object = {}) {
  /* ---- data-URL → Blob ---- */
  const imgBlob = await (await fetch("data:image/png;base64," + dataUrl)).blob();   // universal + simplest
  // Prepare download for highlighted image
  const highlightedDataUrl = await highlightTopThreeCellsFromBlob(imgBlob, top3Cells);
  const imgBlobHighlights = await (await fetch(highlightedDataUrl)).blob(); // Convert data URL to Blob
  // (Browsers ≥ Chromium 85 / FF 76 support fetch(dataUrl))

  /* ---- JSON side-car ---- */
  const meta = {
    imageId: frameId,
    savedAt: new Date().toISOString(),
    landingCandidates: top3Cells,
    ...extras
  };
  const jsonBlob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });

  /* ---- trigger both downloads ---- */
  triggerDownload(jsonBlob,  `${frameId}--ai-output-and-metadata.json`);
  triggerDownload(imgBlob,   `${frameId}--grid-overlay.png`);
  triggerDownload(imgBlobHighlights,   `${frameId}--top-three-highlighted.png`);
}
  
/* helper: identical to earlier snippet */
function triggerDownload(blob: any, filename: string) {
  console.log("Triggering download for:", filename, blob);
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function highlightTopThreeCellsFromBlob(
  blob: Blob,
  top3Cells: Array<Object>,
) {
  return new Promise<any>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // semi-transparent green for highlights
      // Calculate cell dimensions
      const cellWidth = img.width / 10;
      const cellHeight = img.height / 10;
      // use cell id (e.g: E5) and highlight cell in green
      top3Cells.forEach((cell: any) => {
        const row = cell.id[0].charCodeAt(0) - 'A'.charCodeAt(0); // Convert letter to index (A=0, B=1, ...)
        const col = parseInt(cell.id.slice(1)) - 1; // Convert number to index (1-based to 0-based)
        if (row < 0 || row >= 10 || col < 0 || col >= 10) {
          console.warn(`Invalid cell identifier: ${cell.id}`);
          return;
        }
        const x = col * cellWidth;
        const y = row * cellHeight;
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }
      );
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => {
      reject(new Error("Failed to load image from blob: " + err));
    }
    img.src = URL.createObjectURL(blob);
    // Return data:image blob image for download
    console.log("IMAGE SOURCE DOWNLOAD:", img.src);
    return img.src;
  });
}
