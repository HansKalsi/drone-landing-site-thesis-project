import React, { useContext, useEffect, useRef, useState } from "react";
import { imageB64ForAIContext } from "./MainScreen";

export interface GridOverlayProps {
  imageSrc: string;
  rows?: number;      // default 10 → A‑J
  cols?: number;      // default 10 → 1‑10
  lineColor?: string; // CSS‑color → grid lines
  lineWidth?: number; // px
  labelColor?: string;
  outlineColor?: string;
  className?: string; // optional wrapper class
  refOverlay?: React.RefObject<HTMLCanvasElement>;
  onlyKeepCell?: string;
  cellsToExclude?: string[]; // cells to exclude from the grid overlay
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const GridOverlay: React.FC<GridOverlayProps> = ({
  imageSrc,
  rows = 10,
  cols = 10,
  lineColor = "white",
  lineWidth = 2,
  labelColor = "#ffffff",
  outlineColor = "#000000",
  className = "",
  refOverlay,
  onlyKeepCell,
  cellsToExclude = [],
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { originalImageGridOverlay, setOriginalImageGridOverlay } = useContext(imageB64ForAIContext);

  /**
   * Draw the grid and labels once the image is fully loaded.
   */
  useEffect(() => {
    if (!loaded) return;
    const img = imgRef.current;
    const canvas = refOverlay!.current;
    if (!img || !canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = img.naturalWidth / cols;
    const cellH = img.naturalHeight / rows;

    // Clear & set styles
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;

    // --- Grid lines ---
    for (let r = 1; r < rows; r++) {
      const y = r * cellH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let c = 1; c < cols; c++) {
      const x = c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // --- Labels ---
    const fontSize = Math.min(cellW, cellH) * 0.25;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const drawLabel = (text: string, x: number, y: number) => {
      // outline for contrast
      ctx.fillStyle = outlineColor;
      [-1, 0, 1].forEach((dx) =>
        [-1, 0, 1].forEach((dy) => {
          if (dx || dy) ctx.fillText(text, x + dx, y + dy);
        })
      );
      // fill
      ctx.fillStyle = labelColor;
      ctx.fillText(text, x, y);
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const label = `${ALPHABET[r]}${c + 1}`;
        const x = c * cellW + cellW * 0.35;
        const y = r * cellH + cellH * 0.35;
        drawLabel(label, x, y);
      }
    }

    if (onlyKeepCell) {
        blockOutImageExceptOneCell(onlyKeepCell);
    }

    if (cellsToExclude && cellsToExclude.length > 0) {
      console.log("Excluding cells from overlay:", cellsToExclude);
      cellsToExclude.forEach(cell => {
        blockOutOneCellInImage(cell);
      });
    }

    const off = document.createElement("canvas");
    off.width  = imgRef.current?.naturalWidth || 0;
    off.height = imgRef.current?.naturalHeight || 0;
    const gridOverlayedCtx = off.getContext("2d")!;
    if (imgRef.current === null) {
      console.error("Image not loaded yet -- skipping grid overlay recording.");
      return;
    }
    if (!refOverlay || refOverlay?.current === null) {
      console.error("Overlay canvas not available -- skipping grid overlay recording.");
      return;
    }
    gridOverlayedCtx.drawImage(imgRef.current, 0, 0);
    gridOverlayedCtx.drawImage(refOverlay.current, 0, 0);
    const b64 = off.toDataURL("image/png").split(",")[1];
    if (originalImageGridOverlay === null && b64) {
      setOriginalImageGridOverlay(b64); // store original image for later download
    } else {
      console.warn("Original image grid overlay already set, skipping update.");
    }
  }, [loaded, rows, cols, lineColor, lineWidth, labelColor, outlineColor, onlyKeepCell, cellsToExclude]);

  function blockOutImageExceptOneCell(cellToKeep: string) {
    const canvas = refOverlay!.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear previous drawings
    // Fill all cells with a solid colour except a particular grid cell
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const label = `${ALPHABET[r]}${c + 1}`;
        if (label === cellToKeep) continue; // skip the cell to keep
        const x = c * (canvas.width / cols);
        const y = r * (canvas.height / rows);
        ctx.fillStyle = "rgba(0, 0, 0, 1)"; // black
        // Fill space (the +2 is to add padding to ensure there's no gaps)
        ctx.fillRect(x, y, (canvas.width / cols) + 2, (canvas.height / rows) + 2);
      }
    }
  }

  // Blocks out a particular cell in the image overlay
  function blockOutOneCellInImage(cellToBlock: string) {
    const canvas = refOverlay!.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Update canvas to block out the specified cell
    const cellIndex = ALPHABET.indexOf(cellToBlock[0]);
    const colIndex = parseInt(cellToBlock.slice(1)) - 1; // convert to 0-based index
    if (cellIndex < 0 || colIndex < 0 || cellIndex >= rows || colIndex >= cols) {
      console.warn(`Invalid cell identifier: ${cellToBlock}`);
      return;
    }
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const x = colIndex * cellW;
    const y = cellIndex * cellH;
    ctx.fillStyle = "rgba(0, 0, 0, 1)"; // solid black to block out
    ctx.fillRect(x, y, cellW, cellH);
  }

  /* ──────────────────────── DOWNLOAD COMPOSITE PNG ─────────────────────── */
  const downloadComposite = () => {
      const img = imgRef.current;
      const overlay = refOverlay!.current;
      console.log(img, overlay);
      if (!img || !overlay) return;
  
      // Off‑screen canvas to merge image + overlay
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx = off.getContext("2d");
      if (!ctx) return;
  
      ctx.drawImage(img, 0, 0, off.width, off.height);      // base image
      ctx.drawImage(overlay, 0, 0, off.width, off.height);  // grid & labels
  
      const link = document.createElement("a");
      link.download = "frame_with_grid.png";
      link.href = off.toDataURL("image/png");
      link.click();
  };

  // ---------------- Render ----------------
  return (
    <div className={`grid-overlay ${className}`} style={{ maxWidth: "100%" }}>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Grid Overlay Preview
      </h2>

      <h3>Raw Image</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flexDirection: "column" }}>
        {/* raw frame */}
        <div style={{ position: "relative" }}>
          <img
            crossOrigin="anonymous"
            id="raw-image"
            ref={imgRef}
            src={imageSrc}
            alt="Raw frame"
            onLoad={() => setLoaded(true)}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

        <h3 style={{ marginBottom: 'unset' }}>Image with Grid (or modified)</h3>
        {loaded && (
          <button
            onClick={downloadComposite}
            style={{ padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer", width: 'fit-content', alignSelf: 'center' }}
          >
            Download Shown Image
          </button>
        )}
        {/* overlay frame */}
        <div style={{ position: "relative" }}>
          <img
            crossOrigin="anonymous"
            src={imageSrc}
            alt="Frame with grid overlay"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <canvas
            ref={refOverlay}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default GridOverlay;
