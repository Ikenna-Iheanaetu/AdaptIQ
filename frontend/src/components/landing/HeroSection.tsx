import ParticleCanvas from './ParticleCanvas';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden hero-gradient">
      {/* Particle background */}
      <ParticleCanvas />

      {/* All content sits above particles */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 lg:px-16 py-5">
          <span className="text-white font-black text-2xl tracking-tighter italic">AdaptIQ</span>
          <div className="flex items-center gap-2">
            <a href="/login">
              <button className="px-5 py-2 text-white/80 text-sm font-medium hover:text-white transition-colors">
                Log in
              </button>
            </a>
            <a href="/signup">
              <button className="px-5 py-2 bg-white/15 text-white text-sm font-semibold rounded-xl backdrop-blur border border-white/20 hover:bg-white/25 transition-all">
                Get started
              </button>
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div className="flex flex-col lg:flex-row items-center gap-12 px-6 lg:px-16 py-16 lg:py-24 flex-1">
          {/* Left column */}
          <div className="max-w-2xl">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#6a1edb] animate-pulse" />
              <span className="text-white text-xs font-medium tracking-widest uppercase">
                AI-Powered Learning Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              Learn to code
              <br />
              <span className="text-[#b4c5ff]">smarter,</span>
              <br />
              not harder.
            </h1>

            {/* Sub-copy */}
            <p className="text-[#dbe1ff] text-xl max-w-xl mb-12 font-light leading-relaxed">
              Personalized paths that adapt to your skill level. Master any programming language
              with AI-driven diagnostics and real-time feedback.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/signup">
                <button
                  className="px-8 py-4 rounded-xl text-white font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
                >
                  Get started free
                </button>
              </a>
              <a href="/curriculum">
                <button className="px-8 py-4 bg-white/10 text-white text-lg font-semibold rounded-xl backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
                  View curriculum
                </button>
              </a>
            </div>
          </div>

          {/* Right column — glass code panel */}
          <div className="hidden lg:block flex-shrink-0 w-[380px]">
            <div className="glass-panel p-7 rounded-3xl border border-white/20 shadow-2xl transform rotate-3">
              {/* Traffic light dots + filename */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28ca41]" />
                <span className="ml-auto text-xs font-mono text-white/40 tracking-widest">
                  AI_ASSISTANT.JS
                </span>
              </div>

              {/* Code block */}
              <div className="font-mono text-sm space-y-3 mt-5">
                {/* Line 01 */}
                <div className="flex gap-3">
                  <span className="text-white/20 select-none">01</span>
                  <span>
                    <span className="text-[#b4c5ff]">const </span>
                    <span className="text-white/80">adapt = (level) =&gt; {'{'}</span>
                  </span>
                </div>

                {/* Line 02 */}
                <div className="flex gap-3">
                  <span className="text-white/20 select-none">02</span>
                  <span className="pl-4">
                    <span className="text-[#9b6dff]">if </span>
                    <span className="text-white/80">(level === </span>
                    <span className="text-[#ffd580] bg-white/10 px-1 rounded">&apos;advanced&apos;</span>
                    <span className="text-white/80">) {'{'}</span>
                  </span>
                </div>

                {/* Line 03 */}
                <div className="flex gap-3">
                  <span className="text-white/20 select-none">03</span>
                  <span className="pl-8">
                    <span className="text-[#b4c5ff]">return </span>
                    <span className="text-white/80">challengeNext();</span>
                  </span>
                </div>

                {/* Line 04 */}
                <div className="flex gap-3">
                  <span className="text-white/20 select-none">04</span>
                  <span className="pl-4 text-white/80">{'}'}</span>
                </div>

                {/* Line 05 */}
                <div className="flex gap-3">
                  <span className="text-white/20 select-none">05</span>
                  <span className="text-white/80">{'}'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
