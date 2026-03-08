import React from 'react';
import { Compass } from 'lucide-react';

export function FlowOverview({ colors, steps, combos }) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
      <div className="px-5 py-7 md:px-10 md:py-10" style={{ backgroundColor: colors.primary }}>
        <img
          src="/yogurtland-logo.png"
          alt="Yogurtland"
          className="mb-4 h-6 object-contain md:mb-5 md:h-7"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70 md:text-sm md:tracking-[0.32em]">Play. Discover. Share. Visit.</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
          Discover Yogurtland combos before the store visit.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:mt-4 md:text-base md:leading-7">
          This experience starts with a Flavor Test, opens into community recommendations, and ends with a visit-ready combo code.
        </p>
      </div>

      <div className="space-y-6 p-5 md:space-y-8 md:p-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-2xl border border-black/5 p-4 md:rounded-3xl md:p-5"
              style={{ backgroundColor: index % 2 === 0 ? colors.primaryLight : colors.greenLight }}
            >
              <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: index % 2 === 0 ? colors.primary : colors.greenDark }}>
                {step.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 md:mt-3">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl p-5 md:rounded-3xl md:p-6" style={{ backgroundColor: colors.paper }}>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
              <Compass className="w-4 h-4" />
              Why this service works
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">Flavor discovery becomes interactive instead of passive.</div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">Users contribute recommendations through their own combos.</div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">The journey ends in a real Yogurtland visit.</div>
            </div>
          </div>

          <div className="rounded-2xl p-5 text-white md:rounded-3xl md:p-6" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` }}>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-white/70">Community Preview</div>
            <div className="mt-4 grid gap-3">
              {combos.slice(0, 3).map((combo) => (
                <div key={combo.id} className="rounded-2xl bg-white/10 px-4 py-4">
                  <div className="text-lg font-extrabold">{combo.title}</div>
                  <div className="text-sm text-white/70">{combo.flavor} + {combo.toppings.join(' + ')}</div>
                  <div className="mt-2 text-xs leading-5 text-white/65">{combo.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
