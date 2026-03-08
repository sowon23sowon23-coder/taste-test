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
    <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="bg-white rounded-[32px] shadow-xl p-8">
        <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: colors.primary }}>Share</div>
        <h1 className="mt-3 text-4xl font-black leading-tight" style={{ color: colors.ink }}>Create your own combo.</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">This is the UGC step: users turn their taste into a recommendation other people can browse.</p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Combo name</label>
            <input
              type="text"
              value={shareForm.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
              placeholder="My Yogurt Combo"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Flavor</label>
            <select
              value={shareForm.flavor}
              onChange={(event) => onFieldChange('flavor', event.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-pink-300 bg-white"
            >
              <option value="">Select a flavor</option>
              {availableFlavors.map((flavor) => <option key={flavor} value={flavor}>{flavor}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Toppings (up to 3)</label>
            <div className="grid grid-cols-2 gap-2">
              {availableToppings.map((topping) => (
                <button
                  key={topping}
                  type="button"
                  onClick={() => onToggleTopping(topping)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold"
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
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onSubmit} style={{ backgroundColor: colors.primary }} className="flex-1 text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity">Share My Combo</button>
            <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-600 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">Back To Discover</button>
          </div>
        </div>
      </section>
      <aside className="space-y-6">
        <section className="bg-white rounded-[32px] shadow-xl p-7">
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
