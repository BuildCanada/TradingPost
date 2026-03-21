"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-sm text-gray-500">Sign in to access the admin panel.</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
