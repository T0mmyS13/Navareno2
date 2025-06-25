"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-xl p-8 animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full shadow-md mb-2 animate-pop">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-blue-700 mb-1 tracking-tight animate-fade-in">Přihlášení</h2>
        <p className="text-gray-500 text-sm animate-fade-in">Vítejte zpět! Přihlaste se ke svému účtu.</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4 animate-fade-in">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-all duration-200 active:scale-95 animate-bounce-in"
        >
          Přihlásit se
        </button>
        {error && <div className="text-red-500 text-center animate-shake">{error}</div>}
      </form>
      <div className="mt-6 text-sm text-gray-600 animate-fade-in flex flex-col items-center gap-2">
        <div>
          Nemáte účet?{' '}
          <Link href="/auth/register" className="text-blue-500 font-semibold hover:underline transition-colors duration-200">Zaregistrujte se</Link>
        </div>
        <div>
          <Link href="/auth/forgot" className="text-blue-500 font-semibold hover:underline transition-colors duration-200">Zapomněli jste heslo?</Link>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes bounce-in {
          0% { transform: scale(0.95); }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}
