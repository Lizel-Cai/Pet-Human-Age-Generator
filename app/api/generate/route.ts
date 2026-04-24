export async function POST(req: Request) {
  try {
    const { humanAge, gender, image, petType } = await req.json();

    const genderText = gender === 'male' ? 'man' : 'woman';
    const animal = petType === 'dog' ? 'dog' : 'cat';

    const prompt = `
Ultra realistic human portrait photo,
${humanAge} years old ${genderText},
face features exactly same as the uploaded ${animal} photo,
same eyes, same expression, same face shape,
natural skin, soft light, 8K, high detail, realistic portrait
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const res = await fetch(`${process.env.OMGPT_BASE_URL}/images/generations`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OMGPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        image: image,
        size: "1024x1024",
        n: 1,
      }),
    });

    clearTimeout(timeout);
    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "API error" }, { status: 400 });
    }

    return Response.json({ imageUrl: data.data[0].url });

  } catch (e) {
    console.error("Error:", e);
    return Response.json({ error: "Generation failed, please try again" }, { status: 500 });
  }
}