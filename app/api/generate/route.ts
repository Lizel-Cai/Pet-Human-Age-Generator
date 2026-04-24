import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Missing image or prompt" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const res = await openai.images.edit({
      model: "gpt-image-1",
      image,
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = res.data[0].b64_json;
    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}