"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const defaultAvatars = [
    "/images/panda.png",
    "/images/cat.png",
    "/images/chicken.png",
    "/images/man.png",
    "/images/woman.png"

  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Hesla se neshodují.");
      return;
    }
    try {
      let profilePicUrl = selectedAvatar;
      if (profilePic) {
        profilePicUrl = URL.createObjectURL(profilePic);
      }
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, profilePic: profilePicUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrace se nezdařila.");
        return;
      }
      setSuccess("Registrace proběhla úspěšně! Nyní se můžete přihlásit.");
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch {
      setError("Registrace se nezdařila.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-xl p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full shadow-md mb-2">
          {profilePic ? (
            <Image
              src={URL.createObjectURL(profilePic)}
              alt="Profilová fotka"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 shadow"
            />
          ) : selectedAvatar ? (
            <Image
              src={selectedAvatar}
              alt="Profilová fotka"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 shadow"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-blue-700 mb-1 tracking-tight">Registrace</h2>
        <p className="text-gray-500 text-sm">Vytvoř si nový účet a přidej se k nám!</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="text"
          placeholder="Uživatelské jméno"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Heslo"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Heslo znovu"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(v => !v)}
            className="accent-blue-500"
          />
          Zobrazit heslo
        </label>
        <div className="flex flex-col gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100 mt-2">
          <label className="block text-sm text-blue-700 font-semibold mb-1 flex items-center gap-2">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm-2 2h.01M7 17a4 4 0 108 0 4 4 0 00-8 0z' /></svg>
            Nahrát vlastní profilovku
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setProfilePic(e.target.files?.[0] || null)}
            className="mb-2 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-200 file:text-blue-700 file:font-semibold file:cursor-pointer"
          />
          {profilePic && (
            <div className="flex items-center gap-2 mt-1">
              <Image
                src={URL.createObjectURL(profilePic)}
                alt="Náhled"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border-2 border-blue-400"
              />
              <span className="text-xs text-gray-500">Náhled</span>
            </div>
          )}
          <div className="mt-2 text-sm text-blue-700 font-semibold">Nebo si vyber z výchozích avatarů:</div>
          <div className="flex gap-2 flex-wrap mt-1">
            {defaultAvatars.map((avatar, idx) => (
              <Image
                key={avatar}
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                width={48}
                height={48}
                className={`w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-150 ${selectedAvatar === avatar ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => { setSelectedAvatar(avatar); setProfilePic(null); }}
                style={{ boxShadow: selectedAvatar === avatar ? '0 0 0 2px #3b82f6' : undefined }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-all duration-200 active:scale-95 mt-2"
        >
          Registrovat
        </button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
      </form>
      <div className="mt-6 text-sm text-gray-600 flex items-center gap-1">
        <span>Už máš účet?</span>
        <Link href="/auth/signin" className="text-blue-500 font-semibold hover:underline transition-colors duration-200 flex items-center gap-1">
          Přihlásit se
        </Link>
      </div>
    </div>
  );
}
