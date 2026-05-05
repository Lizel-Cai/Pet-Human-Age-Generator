"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    localStorage.setItem("pet2human_unlimited", "true");

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful</h1>
          <p className="text-gray-600 mb-1">Unlimited generation unlocked!</p>
          <p className="text-sm text-gray-500">{countdown}s back to home...</p>
        </div>
      </div>

      {/* ✅ 正确底部广告（无重复 push，无报错） */}
      <div className="w-full flex justify-center py-3 bg-white border-t">
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-client="ca-pub-9524124855358338"
          data-ad-slot="2584579157"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
}