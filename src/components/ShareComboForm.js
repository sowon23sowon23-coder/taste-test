import React from 'react';
import { Sparkles } from 'lucide-react';

export function ShareComboForm({
  colors,
  shareForm,
  availableFlavors,
  availableToppings,
  recommendation,
  onFieldChange,
  onToggleTopping,
  onSubmit,
  onBack
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] bg-white p-5 shadow-xl md:rounded-[32px] md:p-8">
        <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: colors.primary }}>Share</div>
        <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: colors.ink }}>Create your own combo.</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">This is the UGC step: users turn their taste into a recommendation other people can browse.</p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Combo name</label>
            <input
              type="text"
              value={shareForm.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
              placeholder="My Yogurt Combo"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-base outline-none focus:border-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Flavor</label>
            <select
              value={shareForm.flavor}
              onChange={(event) => onFieldChange('flavor', event.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base outline-none focus:border-pink-300"
            >
              <option value="">Select a flavor</option>
              {availableFlavors.map((flavor) => <option key={flavor} value={flavor}>{flavor}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Toppings (up to 3)</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableToppings.map((topping) => (
                <button
                  key={topping}
                  type="button"
                  onClick={() => onToggleTopping(topping)}
                  className="min-h-[52px] rounded-2xl px-4 py-3 text-left text-sm font-semibold"
                  style={{
                    backgroundColor: shareForm.toppings.includes(topping) ? colors.greenLight : '#f9fafb',
                    color: shareForm.toppings.includes(topping) ? colors.greenDark : '#4b5563'
                  }}
                >
                  {topping}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Short description</label>
            <textarea
              rows="4"
              value={shareForm.description}
              onChange={(event) => onFieldChange('description', event.target.value)}
              placeholder="Why should someone try this combo?"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-base outline-none focus:border-pink-300"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onSubmit} style={{ backgroundColor: colors.primary }} className="safe-bottom flex-1 rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">Share My Combo</button>
            <button onClick={onBack} className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200">Back To Discover</button>
          </div>
        </div>
      </section>
      <aside className="space-y-6">
        <section className="rounded-[28px] bg-white p-5 shadow-xl md:rounded-[32px] md:p-7">
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
            <Sparkles className="w-4 h-4" />
            Starting Point
          </div>
          <div className="mt-4 rounded-3xl p-5" style={{ backgroundColor: colors.primaryLight }}>
            <div className="text-lg font-extrabold text-gray-800">{recommendation?.flavor || 'Pick a flavor'}</div>
            <div className="mt-2 text-sm text-gray-600">
              {(recommendation?.toppings || []).join(' + ') || 'Choose toppings to define your combo.'}
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
