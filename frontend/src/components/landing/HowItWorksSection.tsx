import { Brain, BarChart3, TrendingUp } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="bg-[#f9f9ff] py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#141b2b] tracking-tight mb-4">
              The Blueprint to Mastery
            </h2>
            <p className="text-[#434655] text-lg max-w-xl">
              We've engineered a feedback loop that evolves with you, ensuring you're always in the 'Goldilocks Zone' of learning.
            </p>
          </div>
          <span className="hidden md:block text-8xl font-black text-[#dce2f7] select-none">
            01-03
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Precision Diagnostic */}
          <div className="group bg-[#f1f3ff] p-10 rounded-[2rem] hover:bg-[#dce2f7] transition-all duration-500 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="w-14 h-14 bg-[#004ac6]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#004ac6] transition-colors duration-500">
                <Brain size={28} className="text-[#004ac6] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#141b2b] mb-4">Precision Diagnostic</h3>
              <p className="text-[#434655] leading-relaxed">
                Our engine identifies your knowledge gaps in under 5 minutes. No more repeating what you already know.
              </p>
            </div>
            <div className="mt-auto pt-8">
              <span className="text-[#004ac6] font-bold text-xs tracking-widest uppercase">
                Phase One
              </span>
            </div>
          </div>

          {/* Card 2 — Adaptive Quizzes */}
          <div className="group bg-[#f1f3ff] p-10 rounded-[2rem] hover:bg-[#dce2f7] transition-all duration-500 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="w-14 h-14 bg-[#6a1edb]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6a1edb] transition-colors duration-500">
                <BarChart3 size={28} className="text-[#6a1edb] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#141b2b] mb-4">Adaptive Quizzes</h3>
              <p className="text-[#434655] leading-relaxed">
                Dynamic challenges that adjust difficulty in real-time based on your response speed and accuracy.
              </p>
            </div>
            <div className="mt-auto pt-8">
              <span className="text-[#6a1edb] font-bold text-xs tracking-widest uppercase">
                Phase Two
              </span>
            </div>
          </div>

          {/* Card 3 — Growth Intelligence */}
          <div className="group bg-[#f1f3ff] p-10 rounded-[2rem] hover:bg-[#dce2f7] transition-all duration-500 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="w-14 h-14 bg-[#455f87]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#455f87] transition-colors duration-500">
                <TrendingUp size={28} className="text-[#455f87] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#141b2b] mb-4">Growth Intelligence</h3>
              <p className="text-[#434655] leading-relaxed">
                Visual data mapping your journey from novice to architect with predictive proficiency scores.
              </p>
            </div>
            <div className="mt-auto pt-8">
              <span className="text-[#455f87] font-bold text-xs tracking-widest uppercase">
                Phase Three
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
