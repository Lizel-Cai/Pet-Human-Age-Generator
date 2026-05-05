import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

    if (!secret) {
      return NextResponse.json({ success: true });
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(body).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const data = JSON.parse(body);
    const event = data.meta?.event_name;

    if (event === "order_paid") {
      const email = data.data.attributes.user_email;
      console.log("✅ 支付成功：", email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}