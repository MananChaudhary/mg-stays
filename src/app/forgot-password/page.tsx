import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a link to get back into your account"
    >
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
      <Link
        href="/sign-in"
        className="mt-6 block text-center text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Back to sign in
      </Link>
    </AuthShell>
  );
}
