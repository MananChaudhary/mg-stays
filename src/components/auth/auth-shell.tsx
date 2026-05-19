import Link from "next/link";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white">
            MG
          </div>
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            MG Stays
          </span>
        </Link>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-neutral-400">
          Secure authentication powered by Clerk
        </p>
      </div>
    </div>
  );
}
