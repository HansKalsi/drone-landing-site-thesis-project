/**
 *  - downloads <frameId>.png   – decoded image
 *  - downloads <frameId>.json – landing-site metadata
 *
 * @param {string}        dataUrl    full data-URL (image/png or image/jpeg)
 * @param {string}        frameId    unique image ID (used in filenames)
 * @param {Array<Object>} top3Cells  [{row, col, score}, …]
 * @param {Object}        extras     optional extra fields for the JSON
 */
export async function saveScenario(dataUrl: string, frameId: string, top3Cells: Array<Object>, extras = {}) {
    /* ---- data-URL → Blob ---- */
    const imgBlob = await (await fetch("data:image/png;base64," + dataUrl)).blob();   // universal + simplest
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
    triggerDownload(jsonBlob,  `${frameId}.json`);
    triggerDownload(imgBlob,   `${frameId}.png`);
  }
  
  /* helper: identical to earlier snippet */
  function triggerDownload(blob: any, filename: string) {
    const url  = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  