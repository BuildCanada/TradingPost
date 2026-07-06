"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { BASE_PATH } from "@/app/bills/utils/basePath";

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (error) console.error("Sign-in error:", error);
  }, [error]);

  const onGoogle = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: BASE_PATH || "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="type-h3 text-dark">Sign in</h1>
        {error && (
          <div className="text-sm text-accent">
            {error === "AccessDenied"
              ? "Your email is not allowed."
              : "Sign-in failed. Please try again."}
          </div>
        )}
        <Button
          as="button"
          variant="charcoal"
          disabled={loading}
          className="w-full justify-center"
          onClick={onGoogle}
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] w-full flex items-center justify-center">
          <div className="w-full max-w-sm space-y-4">
            <h1 className="type-h3 text-dark">Sign in</h1>
            <Button
              as="button"
              variant="charcoal"
              disabled
              className="w-full justify-center"
            >
              Loading...
            </Button>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
