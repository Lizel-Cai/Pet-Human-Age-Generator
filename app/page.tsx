"use client";
import { useState, useRef, useEffect } from "react";

const DAILY_FREE_LIMIT = 3;

export default function PetToHumanAI() {
  const [petImg, setPetImg] = useState<string | null>(null);
  const [petType, setPetType] = useState("dog");
  const [petYear, setPetYear] = useState("1");
  const [petMonth, setPetMonth] = useState("0");
  const [weight, setWeight] = useState("5");
  const [gender, setGender] = useState("female");
  const [nation, setNation] = useState("eastAsia");

  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [freeCount, setFreeCount] = useState(DAILY_FREE_LIMIT);
  const [showPayModal, setShowPayModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = new Date().toLocaleDateString();
    const storeDate = localStorage.getItem("petHumanDate");
    const storeUsed = Number(localStorage.getItem("petHumanUsed") || "0");
    
    // 统一解锁字段
    const isUnlimited = localStorage.getItem("pet2human_unlimited") === "true";

    setUnlimited(isUnlimited);

    if (isUnlimited) {
      setFreeCount(999);
      return;
    }

    if (storeDate !== today) {
      localStorage.setItem("petHumanDate", today);
      localStorage.setItem("petHumanUsed", "0");
      setFreeCount(DAILY_FREE_LIMIT);
    } else {
      const left = DAILY_FREE_LIMIT - storeUsed;
      setFreeCount(left < 0 ? 0 : left);
      if (left <= 0) setShowPayModal(true);
    }
  }, []);

  const useOneCount = () => {
    if (unlimited) return;
    const used = Number(localStorage.getItem("petHumanUsed") || "0") + 1;
    localStorage.setItem("petHumanUsed", String(used));
    const left = DAILY_FREE_LIMIT - used;
    setFreeCount(left < 0 ? 0 : left);
    if (left <= 0) setShowPayModal(true);
  };

  const getHumanAge = () => {
    const year = Number(petYear) || 0;
    const month = Number(petMonth) || 0;
    const totalPetAge = year + month / 12;
    if (totalPetAge <= 1) return Math.round(totalPetAge * 15);
    if (totalPetAge <= 2) return Math.round(15 + (totalPetAge - 1) * 9);
    return Math.round(24 + (totalPetAge - 2) * 4);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPetImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!petImg) return alert("Please upload a photo first");
    if (freeCount <= 0 && !unlimited) {
      setShowPayModal(true);
      return;
    }

    setLoading(true);
    const humanAge = getHumanAge();

    try {
      const res = await fetch(petImg);
      const blob = await res.blob();
      const imageFile = new File([blob], "pet.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("gender", gender);
      formData.append("humanAge", humanAge.toString());
      formData.append("petType", petType);
      formData.append("nation", nation);
      formData.append("unlimited", unlimited ? "true" : "false");

      const apiRes = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await apiRes.json();
      if (data.image) {
        setResultImg(data.image);
        useOneCount();
      } else if (data.limit) {
        setShowPayModal(true);
      } else {
        alert(data.error || "Generate failed");
      }
    } catch (e) {
      console.error(e);
      alert("Generate failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-sky-50 via-pink-50 to-purple-50 py-10 px-4 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">🐾 Pet To Human AI</h1>
          <p className="text-purple-500 mt-2 text-sm">Turn your lovely pet into a cute human~</p>
        </div>

        <div className="bg-white rounded-[36px] shadow-xl p-6 space-y-5 overflow-hidden">
          <div className="border-2 border-dashed border-indigo-200 rounded-3xl p-5 text-center cursor-pointer bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100 transition-all duration-500 animate-pulse" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <p className="text-indigo-400 text-sm mb-3">🐶 Click to upload pet photo</p>
            {petImg && <img src={petImg} className="w-36 h-36 object-cover rounded-2xl mx-auto shadow-md hover:scale-105 transition-transform duration-300" alt="pet" />}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 ml-1">Pet Type</label>
              <select className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" value={petType} onChange={(e) => setPetType(e.target.value)}>
                <option value="dog">🐶 Dog</option>
                <option value="cat">🐱 Cat</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 ml-1">Age (Years)</label>
              <select className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" value={petYear} onChange={(e) => setPetYear(e.target.value)}>
                {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(y => (<option key={y} value={String(y)}>{y} Years</option>))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 ml-1">Age (Months)</label>
              <select className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" value={petMonth} onChange={(e) => setPetMonth(e.target.value)}>
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => (<option key={m} value={String(m)}>{m} Months</option>))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 ml-1">Weight (kg)</label>
              <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" min="0" step="0.1" />
            </div>

            <div>
              <label className="text-xs text-gray-500 ml-1">Human Gender</label>
              <select className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="female">Girl 🎀</option>
                <option value="male">Boy 🎩</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 ml-1">Appearance Style</label>
              <select className="w-full p-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all" value={nation} onChange={(e) => setNation(e.target.value)}>
                <option value="eastAsia">East Asian 🏮</option>
                <option value="european">European 🎌</option>
                <option value="japanKorea">Japan & Korea 🌸</option>
              </select>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 p-3 rounded-2xl text-sm font-semibold text-center shadow-sm">
              🎂 Human Age: {getHumanAge()} Years Old
            </div>
          </div>

          {!unlimited ? (
            <div className="text-center text-xs text-purple-400">
              🎁 Free tries left today: {freeCount}
            </div>
          ) : (
            <div className="text-center text-xs text-green-600 font-semibold">
              ✨ UNLOCKED: Unlimited generations
            </div>
          )}

          <button onClick={generate} disabled={loading || !petImg} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 shadow-lg hover:shadow-indigo-200">
            {loading ? <span className="inline-flex items-center gap-2"><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> Generating...</span> : "🐾 Generate My Pet Human"}
          </button>

          {resultImg && (
            <div className="mt-4 opacity-100 translate-y-0 transition-all duration-700">
              <p className="font-medium text-sm text-center text-indigo-600">Your Lovely Result ✨</p>
              <img src={resultImg} className="w-full rounded-3xl shadow-lg mt-2 hover:scale-[1.02] transition-transform duration-500" alt="Result" />
            </div>
          )}
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-center text-indigo-600 mb-3">✨ Free Limit Reached</h3>
            <p className="text-sm text-gray-500 text-center mb-4">You have used up all free chances today.<br/>Unlock unlimited generation forever!</p>
            
            <div className="text-center mb-4 py-3 bg-purple-50 rounded-2xl">
              <p className="text-purple-600 font-bold text-lg">Only $2.99</p>
              <p className="text-xs text-gray-400">One-time payment, lifetime use</p>
            </div>

            <div className="space-y-3">
              <a
                href="https://pettohumanai.lemonsqueezy.com/checkout/buy/2c7c6234-f762-4144-81aa-99ea71100a62"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-2xl font-medium text-center"
              >
                💰 Unlock Now
              </a>

              {/* 提示：付款后访问解锁页 */}
              <p className="text-xs text-center text-gray-400 mt-1">
                After payment, visit: <br/>
                <span className="text-purple-500 font-medium">https://pet2human.vercel.app/success</span>
              </p>

              <button onClick={() => setShowPayModal(false)} className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}