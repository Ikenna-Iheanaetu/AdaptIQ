import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export default function CtaFooter() {
  const currentYear = format(new Date(), "yyyy");

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #004ac6 0%, #6a1edb 100%)" }}
    >
      <div className="relative z-10 py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col items-center text-center">
          <h2 className="text-white text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight mb-8">
            Ready to level up?
          </h2>

          <div className="w-20 h-1 bg-white/25 rounded-full mb-12" />

          <a
            href="/signup"
            className="group inline-flex items-center gap-3 px-12 py-5 bg-white text-[#004ac6] text-xl font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-all"
          >
            Get started free
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="mt-24 w-full flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/10 pt-10">
            <span className="text-white font-black text-xl tracking-tighter italic">
              AdaptIQ
            </span>

            <nav className="flex gap-8">
              <a
                href="#"
                className="text-white/50 text-sm font-medium uppercase tracking-widest hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-white/50 text-sm font-medium uppercase tracking-widest hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-white/50 text-sm font-medium uppercase tracking-widest hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>

            <span className="text-white/30 text-xs">
              © {currentYear} AdaptIQ Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
