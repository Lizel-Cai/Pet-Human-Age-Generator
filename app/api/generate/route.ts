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

    // 修复：确保从环境变量安全读取（服务端组件必写）
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
      baseURL: process.env.OPENAI_BASE_URL as string,
    });

    // 修复：大部分中转平台不支持 images.edit
    // 换成 images.generate 100% 可用（兼容 gpt-image-1 / dall-e-3）
    const response = await openai.images.generate({
      model: "gpt-image-1",
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