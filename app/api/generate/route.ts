import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!image || !prompt) {
      return NextResponse.json({ error: "Please upload image and prompt" }, { status: 400 });
    }

    // 🔥 用带 NEXT_PUBLIC_ 的变量
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL!,
    });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: image,
      prompt: prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = response.data[0].b64_json;
    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Generate failed" }, { status: 500 });
  }
}