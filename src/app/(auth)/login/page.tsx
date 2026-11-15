"use client";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="w-full max-w-md animate-pulse"><div className="h-80 bg-muted rounded-xl" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}