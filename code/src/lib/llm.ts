import { httpsToBase64 } from '../test';

export async function askLLM(systemText: string, userText: string) {
  const urlImage = "https://hips.hearstapps.com/hmg-prod/images/chihuahua-dog-running-across-grass-royalty-free-image-1580743445.jpg?crop=0.66658xw:1xh;center,top&resize=980:*";
  // Get raw base 64 image data from a URL
  const { mime, b64 } = await httpsToBase64(urlImage);
  const imageURI = `data:${mime};base64,${b64}`;

  console.log(`Image URI: ${imageURI}`);
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
    temperature: 0.7
  };

  const rsp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!rsp.ok) throw new Error(`LLM error ${rsp.status}`);
  return (await rsp.json()).choices[0].message.content as string;
}
