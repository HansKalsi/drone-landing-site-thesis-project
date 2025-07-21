export async function askLLM(systemText: string, userText: string, imageB64: string = "") {
  let imageURI: string = "";
  if (imageB64) {
    console.log("Using provided base64 image data");
    // If imageB64 is provided, use it instead of fetching from URL
    imageURI = `data:image/jpeg;base64,${imageB64}`;
  } else {
    console.error("------No image provided------");
  }

  const body = {
    model: 'qwen/qwen2.5-vl-7b',
    messages: [
      { role: 'system', content: systemText },
      { role: 'user',
          content: [
              {type: "text", text: userText},
              {
                  type: "image_url",
                  image_url: { 
                    url: imageURI
                  }
              }
          ]
      }
    ],
    temperature: 0, // 0 for deterministic output, 1 for more creative
    top_p: 1, // to ensure the model focuses on the most likely tokens for it's text response
  };

  const rsp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!rsp.ok) throw new Error(`LLM error ${rsp.status}`);
  return (await rsp.json()).choices[0].message.content as string;
}
