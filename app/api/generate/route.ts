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

    // 🔥 固定使用 gpt-image-1，环境变量读取，不写死 key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENAI_BASE_URL!,
    });

    // ✅ 保持你要的：gpt-image-1 + images.edit
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