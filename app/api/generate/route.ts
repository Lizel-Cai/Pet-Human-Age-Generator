import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const gender = formData.get("gender") as string;
    const humanAge = formData.get("humanAge") as string;
    const petType = formData.get("petType") as string;
    const nation = formData.get("nation") as string; // 新增国籍

    // 必传字段校验
    if (!image || !gender || !humanAge || !petType || !nation) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 国籍风格描述（后端隐藏，不暴露）
    let nationStyle = "";
    switch (nation) {
      case "eastAsia":
        nationStyle = "East Asian, Chinese oriental appearance";
        break;
      case "european":
        nationStyle = "European and American, deep stereo facial features";
        break;
      case "japanKorea":
        nationStyle = "Japanese and Korean soft delicate facial features";
        break;
      default:
        nationStyle = "natural good looking";
    }

    // ✅ 提示词 + 国籍（完全隐藏）
    const prompt = `Real ${gender} human portrait, ${humanAge} years old, ${nationStyle}, cute face, looks exactly like the ${petType} in the reference image, high detail, 8K, realistic, professional photography`;

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL!,
    });

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