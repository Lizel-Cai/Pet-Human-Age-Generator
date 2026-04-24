import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const gender = formData.get("gender") as string;
    const humanAge = formData.get("humanAge") as string;
    const nation = formData.get("nation") as string;
    const petType = formData.get("petType") as string;

    if (!image || !gender || !humanAge || !nation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 国籍风格
    let nationStyle = "";
    if (nation === "eastAsia") nationStyle = "East Asian, Chinese face";
    else if (nation === "european") nationStyle = "European, deep facial contours";
    else nationStyle = "Japanese Korean soft delicate face";

    const prompt = `A ${gender} human portrait, ${humanAge} years old, ${nationStyle}, face looks exactly like the ${petType} in the picture, ultra realistic, 8K`;

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL!,
    });

    // ✅ 唯一真正支持【上传图片】的模型
    const response = await openai.images.edit({
      image: image,
      prompt: prompt,
      model: "dall-e-2",
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    return NextResponse.json({
      image: `data:image/png;base64,${response.data[0].b64_json}`,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Generate failed" },
      { status: 500 }
    );
  }
}