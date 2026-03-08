import React from 'react';
import { MapPin, Ticket } from 'lucide-react';
import { CouponQrCode } from './CouponQrCode';

const formatCreatedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function VisitSummary({
  colors,
  flavorIcon,
  recommendation,
  couponCode,
  storeName,
  couponStatus,
  couponHistory,
  onRegenerate,
  onSaveCoupon,
  onReset
}) {
  const qrValue = JSON.stringify({
    couponCode,
    storeName,
    flavor: recommendation?.flavor,
    toppings: recommendation?.toppings || []
  });

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden">
      <div className="px-8 py-8 md:px-10" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` }}>
        <div className="text-xs font-black uppercase tracking-[0.28em] text-white/70">Visit</div>
        <h1 className="mt-3 text-4xl font-black text-white">Take this combo into the store.</h1>
      </div>
      <div className="p-8 md:p-10 grid gap-6 md:grid-cols-[1fr_0.9fr]">
        <section className="space-y-5">
          <div className="rounded-3xl p-5" style={{ backgroundColor: colors.primaryLight }}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{flavorIcon}</span>
              <div>
                <div className="text-2xl font-extrabold text-gray-800">{recommendation?.flavor}</div>
                <div className="text-sm text-gray-500">{recommendation?.toppings?.join(' + ')}</div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-dashed p-5" style={{ borderColor: `${colors.primary}33` }}>
            <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: colors.primary }}>Try This Flavor</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: colors.greenLight, color: colors.greenDark }}>
              <Ticket className="w-4 h-4" />
              {couponCode}
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Use this code at <span className="font-bold text-gray-800">{storeName}</span> as the final offline conversion step.
            </p>
          </div>
          <CouponQrCode value={qrValue} colors={colors} />
        </section>
        <aside className="rounded-3xl p-6" style={{ backgroundColor: colors.paper }}>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
            <MapPin className="w-4 h-4" />
            Store Connection
          </div>
          <div className="mt-4 text-xl font-extrabold text-gray-800">{storeName}</div>
          <p className="mt-3 text-sm leading-6 text-gray-600">The online experience now ends with a clear store visit action.</p>
          <div className="mt-6 space-y-3">
            <button onClick={onRegenerate} style={{ backgroundColor: colors.primary }} className="w-full text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity">Generate New Code</button>
            <button onClick={onSaveCoupon} className="w-full text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity" style={{ backgroundColor: colors.green }}>
              Save Coupon
            </button>
            {couponStatus && (
              <div className={`rounded-xl px-4 py-3 text-sm ${couponStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {couponStatus.message}
              </div>
            )}
            <button onClick={onReset} className="w-full bg-gray-100 text-gray-600 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">Back To Home</button>
          </div>
          {couponHistory?.length > 0 && (
            <div className="mt-6 border-t border-black/5 pt-5">
              <div className="text-sm font-bold text-gray-800">Saved Coupons</div>
              <div className="mt-3 space-y-2">
                {couponHistory.slice(0, 3).map((coupon) => (
                  <div key={coupon.id} className="rounded-xl bg-white px-3 py-3 text-sm text-gray-600">
                    <div className="font-bold text-gray-800">{coupon.code}</div>
                    <div>{coupon.flavor} + {coupon.toppings.join(' + ')}</div>
                    <div className="text-xs text-gray-400">{coupon.storeName}</div>
                    <div className="mt-1 text-xs text-gray-400">Saved {formatCreatedAt(coupon.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
