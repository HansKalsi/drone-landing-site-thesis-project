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
