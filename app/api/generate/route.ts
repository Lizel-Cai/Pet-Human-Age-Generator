import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DAILY_LIMIT = 3;
const ipRecord: Record<string, { date: string; count: number }> = {};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const today = new Date().toLocaleDateString();
    const formData = await req.formData();

    const unlimited = formData.get("unlimited") === "true";
    const image = formData.get("image") as File;
    const gender = formData.get("gender") as string;
    const humanAge = formData.get("humanAge") as string;
    const petType = formData.get("petType") as string;
    const nation = formData.get("nation") as string;

    if (!image || !gender || !humanAge || !petType || !nation) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!unlimited) {
      if (!ipRecord[ip] || ipRecord[ip].date !== today) {
        ipRecord[ip] = { date: today, count: 1 };
      } else {
        ipRecord[ip].count += 1;
      }

      if (ipRecord[ip].count > DAILY_LIMIT) {
        return NextResponse.json({ limit: true, error: "Daily limit reached" });
      }
    }

    let nationStyle = "";
    switch (nation) {
      case "eastAsia":
        nationStyle = "East Asian, Chinese oriental appearance, elegant features";
        break;
      case "european":
        nationStyle = "European and American, deep stereo facial features, attractive look";
        break;
      case "japanKorea":
        nationStyle = "Japanese and Korean soft delicate facial features, pretty face";
        break;
      default:
        nationStyle = "attractive and good looking";
    }

    const appearance = gender === "male"
      ? "handsome, attractive, charming, perfect facial features, cool, high looks"
      : "beautiful, pretty, gorgeous, cute, elegant, attractive face, high appearance level";

    const prompt = `Real ${gender} human portrait, ${humanAge} years old, ${nationStyle}, ${appearance}, looks exactly like the ${petType} in the reference image, hyper realistic, 8K, high detail, professional portrait photography, soft lighting, clear skin, best quality, ultra-detailed`;

    // ✅ 从环境变量读取（安全、正确、不暴露）
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    // ✅ 安全判断，修复类型报错
    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    const base64 = response.data[0].b64_json;
    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });

  } catch (err: any) {
    console.error("[Generate Error]", err);
    return NextResponse.json({ error: err.message || "Generate failed" }, { status: 500 });
  }
}