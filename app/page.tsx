"use client";
import { useState, useRef } from "react";

export default function PetToHumanAI() {
  const [petImg, setPetImg] = useState<string | null>(null);
  const [petType, setPetType] = useState("dog");
  const [petYear, setPetYear] = useState("1");
  const [petMonth, setPetMonth] = useState("0");
  const [weight, setWeight] = useState("5");
  const [gender, setGender] = useState("female");
  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [freeCount, setFreeCount] = useState(3);
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (freeCount <= 0) return alert("Free limit reached");

    setLoading(true);
    const humanAge = getHumanAge();

    try {
      const res = await fetch(petImg);
      const blob = await res.blob();
      const imageFile = new File([blob], "pet.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("image", imageFile);
      
      // ✅ 前端只传参数，不传提示词！
      formData.append("gender", gender);
      formData.append("humanAge", humanAge.toString());
      formData.append("petType", petType);

      const apiRes = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await apiRes.json();
      if (data.image) {
        setResultImg(data.image);
        setFreeCount(freeCount - 1);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pet To Human AI</h1>
          <p className="text-gray-600 mt-2">Turn your pet into a real human portrait</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <p className="text-gray-500 mb-3">Click to upload pet photo</p>
            {petImg && <img src={petImg} className="w-48 h-48 object-cover rounded-xl mx-auto shadow" alt="pet" />}
          </div>

          <div className="space-y-4">
            <select className="w-full p-4 rounded-xl border bg-gray-50" value={petType} onChange={(e) => setPetType(e.target.value)}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
            <select className="w-full p-4 rounded-xl border bg-gray-50" value={petYear} onChange={(e) => setPetYear(e.target.value)}>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(y => <option key={y} value={String(y)}>{y} Years</option>)}
            </select>
            <select className="w-full p-4 rounded-xl border bg-gray-50" value={petMonth} onChange={(e) => setPetMonth(e.target.value)}>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => <option key={m} value={String(m)}>{m} Months</option>)}
            </select>
            <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50" min="0" step="0.1" />
            <select className="w-full p-4 rounded-xl border bg-gray-50" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <div className="bg-blue-50 text-blue-700 font-semibold p-4 rounded-xl text-center">
              Human Age: {getHumanAge()} Years Old
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">Free tries left today: {freeCount}</div>

          <button onClick={generate} disabled={loading || !petImg || freeCount <= 0} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-lg font-medium disabled:bg-gray-300">
            {loading ? "Generating..." : "Generate Human Portrait"}
          </button>

          {resultImg && (
            <div className="mt-6">
              <p className="font-medium mb-2 text-center">Your AI Result</p>
              <img src={resultImg} className="w-full rounded-xl shadow-lg" alt="result" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}