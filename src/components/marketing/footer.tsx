import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
              MG
            </div>
            <span className="font-semibold">MG Stays</span>
          </div>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} MG Stays. Intelligent hospitality, simplified.
          </p>
          <div className="flex gap-6 text-sm text-neutral-600">
            <Link href="#" className="hover:text-neutral-900">Privacy</Link>
            <Link href="#" className="hover:text-neutral-900">Terms</Link>
            <a href="#demo" className="hover:text-neutral-900">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
