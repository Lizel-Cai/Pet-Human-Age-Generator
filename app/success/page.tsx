"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 自动解锁（和主页面匹配）
    localStorage.setItem("pet2human_unlimited", "true");

    // 倒计时跳转首页
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-1">Unlimited generation unlocked!</p>
        <p className="text-sm text-gray-500">{countdown}s back to home...</p>
      </div>
    </div>
  );
}