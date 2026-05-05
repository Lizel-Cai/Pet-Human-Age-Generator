import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PH上线流量大，上调每日免费限额，兼顾体验与成本
const DAILY_LIMIT = 3;
const ipRecord: Record<string, { date: string; count: number }> = {};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown";
    const today = new Date().toLocaleDateString();
    const formData = await req.formData();

    const unlimited = formData.get("unlimited") === "true";
    const image = formData.get("image") as File;
    const gender = formData.get("gender") as string;
    const humanAge = formData.get("humanAge") as string;
    const petType = formData.get("petType") as string;
    const nation = formData.get("nation") as string;

    // 必传参数校验
    if (!image || !gender || !humanAge || !petType || !nation) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 每日IP限流逻辑，PH流量高峰期稳定运行
    if (!unlimited) {
      if (!ipRecord[ip] || ipRecord[ip].date !== today) {
        ipRecord[ip] = { date: today, count: 1 };
      } else {
        ipRecord[ip].count += 1;
      }

      if (ipRecord[ip].count > DAILY_LIMIT) {
        return NextResponse.json({
          limit: true,
          error: "Daily free limit reached, come back tomorrow for more cute portraits!",
        }, { status: 429 });
      }
    }

    // 可爱风地域风格描述，软萌不生硬，无过度精致感
    let nationStyle = "";
    switch (nation) {
      case "eastAsia":
        nationStyle = "cute East Asian Chinese style, soft gentle facial features, sweet and lovely";
        break;
      case "european":
        nationStyle = "sweet European style, soft delicate features, warm and friendly look";
        break;
      case "japanKorea":
        nationStyle = "soft Japanese and Korean cute style, gentle delicate face, sweet temperament";
        break;
      default:
        nationStyle = "soft cute facial features, warm and lovely appearance";
    }

    // 分性别可爱风外貌描述，保留真人质感，软萌无AI塑料感
    const appearance = gender === "male"
      ? "cute young boy, soft facial contours, natural gentle look, sweet temperament, real skin texture, no artificial filter"
      : "cute young girl, soft delicate face, sweet lovely smile vibe, gentle temperament, natural real skin, lifelike";

    // 核心提示词：可爱风+真人写实，彻底去掉AI感，软萌自然
    const prompt = `Cute photorealistic casual portrait of a ${gender} person, ${humanAge} years old, ${nationStyle}, ${appearance}, facial features and cute temperament match the ${petType} in reference photo, soft warm lighting, natural daily style, real skin texture with subtle pores, no heavy smooth filter, no over perfect face, 8K high detail, shot by real camera, lovely and lifelike`;

    // 关键：移除NEXT_PUBLIC_，防止API Key泄露被盗刷（PH上线强制要求）
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENAI_BASE_URL!,
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = response.data[0].b64_json;
    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });

  } catch (err: any) {
    console.error("[Generate Error]", err);
    return NextResponse.json({ error: "Failed to generate, please try again later" }, { status: 500 });
  }
}