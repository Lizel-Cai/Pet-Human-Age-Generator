export async function POST(req) {
  try {
    const { humanAge, gender, image, petType } = await req.json();

    const genderText = gender === 'male' ? 'man' : 'woman';
    const animal = petType === 'dog' ? 'dog' : 'cat';

    // 强制五官1:1复刻宠物长相
    const prompt = `
Ultra realistic human portrait photo,
${humanAge} years old ${genderText},
strictly highly consistent facial features with reference ${animal} photo,
same eye shape, same eyebrow shape, same nose features, same facial contour, same facial expression,
exactly similar temperament and appearance as pet, natural human skin, soft studio lighting,
8K ultra HD, sharp detail, high realism, portrait, no deformity, no weird face
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
        model: 'gpt-image-1', // 匹配你账号可用模型
        prompt,
        image: image,
        size: '1024x1024', // GPT Image1完美支持方形
        n: 1,
      }),
    });

    clearTimeout(timeout);
    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message }, { status: 400 });
    }

    return Response.json({ imageUrl: data.data[0].url });

  } catch (e) {
    console.error(e);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}