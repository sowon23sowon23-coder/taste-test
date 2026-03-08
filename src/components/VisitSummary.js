import React from 'react';
import { CheckCircle2, Clock3, MapPin, Ticket } from 'lucide-react';
import { CouponQrCode } from './CouponQrCode';
import { CouponStatusBadge } from './CouponStatusBadge';
import { StaffCouponPanel } from './StaffCouponPanel';

const formatCreatedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export function VisitSummary({
  colors,
  flavorIcon,
  recommendation,
  couponCode,
  storeName,
  couponStatus,
  couponHistory,
  activeCoupon,
  selectedHistoryCoupon,
  isRedeemingCoupon,
  onRegenerate,
  onSaveCoupon,
  onRedeemCoupon,
  onSelectCoupon,
  onReset
}) {
  const qrValue = JSON.stringify({
    couponCode,
    storeName,
    flavor: recommendation?.flavor,
    toppings: recommendation?.toppings || []
  });
  const isRedeemed = activeCoupon?.status === 'redeemed';
  const isExpired = activeCoupon?.expiresAt ? new Date(activeCoupon.expiresAt).getTime() < Date.now() : false;
  const canRedeem = activeCoupon && !isRedeemed && !isExpired;

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-xl md:rounded-[32px]">
      <div className="px-5 py-7 md:px-10 md:py-8" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` }}>
        <div className="text-xs font-black uppercase tracking-[0.28em] text-white/70">Visit</div>
        <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Take this combo into the store.</h1>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr] md:p-10">
        <section className="space-y-5">
          <div className="rounded-[24px] p-5 md:rounded-3xl" style={{ backgroundColor: colors.primaryLight }}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{flavorIcon}</span>
              <div>
                <div className="text-2xl font-extrabold text-gray-800">{recommendation?.flavor}</div>
                <div className="text-sm text-gray-500">{recommendation?.toppings?.join(' + ')}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-dashed p-5 md:rounded-3xl" style={{ borderColor: `${colors.primary}33` }}>
            <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: colors.primary }}>Try This Flavor</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: colors.greenLight, color: colors.greenDark }}>
              <Ticket className="w-4 h-4" />
              {couponCode}
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Use this code at <span className="font-bold text-gray-800">{storeName}</span> as the final offline conversion step.
            </p>
            {activeCoupon && (
              <div className="mt-4 grid gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" style={{ color: colors.primary }} />
                  Valid until {formatDateTime(activeCoupon.expiresAt)}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: isRedeemed ? colors.greenDark : colors.primary }} />
                  Status: {isRedeemed ? 'Used in store' : isExpired ? 'Expired' : 'Ready to use'}
                </div>
              </div>
            )}
          </div>
          <CouponQrCode value={qrValue} colors={colors} />
        </section>
        <aside className="rounded-[24px] p-5 md:rounded-3xl md:p-6" style={{ backgroundColor: colors.paper }}>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
            <MapPin className="w-4 h-4" />
            Store Connection
          </div>
          <div className="mt-4 text-xl font-extrabold text-gray-800">{storeName}</div>
          <p className="mt-3 text-sm leading-6 text-gray-600">The online experience now ends with a clear store visit action.</p>
          <div className="mt-6 space-y-3">
            <button onClick={onRegenerate} style={{ backgroundColor: colors.primary }} className="w-full rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">Generate New Code</button>
            <button onClick={onSaveCoupon} className="safe-bottom w-full rounded-2xl px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: colors.green }}>
              Save Coupon
            </button>
            <button
              onClick={onRedeemCoupon}
              disabled={!canRedeem || isRedeemingCoupon}
              className="w-full rounded-2xl px-6 py-4 text-base font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {isRedeemingCoupon ? 'Marking as Used...' : 'Mark Coupon as Used'}
            </button>
            {couponStatus && (
              <div className={`rounded-xl px-4 py-3 text-sm ${couponStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {couponStatus.message}
              </div>
            )}
            <button onClick={onReset} className="w-full rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200">Back To Home</button>
          </div>
          {couponHistory?.length > 0 && (
            <div className="mt-6 border-t border-black/5 pt-5">
              <div className="text-sm font-bold text-gray-800">Saved Coupons</div>
              <div className="mt-3 space-y-2">
                {couponHistory.slice(0, 3).map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => onSelectCoupon?.(coupon)}
                    className={`w-full rounded-xl bg-white px-3 py-3 text-left text-sm text-gray-600 ${selectedHistoryCoupon?.id === coupon.id ? 'ring-2 ring-offset-2' : ''}`}
                    style={selectedHistoryCoupon?.id === coupon.id ? { ringColor: colors.primary } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-gray-800">{coupon.code}</div>
                      <CouponStatusBadge coupon={coupon} />
                    </div>
                    <div>{coupon.flavor} + {coupon.toppings.join(' + ')}</div>
                    <div className="text-xs text-gray-400">{coupon.storeName}</div>
                    <div className="mt-1 text-xs text-gray-400">Valid until {formatDateTime(coupon.expiresAt)}</div>
                    <div className="mt-1 text-xs text-gray-400">Saved {formatCreatedAt(coupon.createdAt)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="border-t border-black/5 bg-[#fffafc] p-5 md:p-10">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[24px] bg-white p-5 shadow-sm md:rounded-3xl">
            <div className="text-sm font-bold" style={{ color: colors.primary }}>Coupon Detail</div>
            {selectedHistoryCoupon ? (
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xl font-extrabold text-gray-800">{selectedHistoryCoupon.code}</div>
                  <CouponStatusBadge coupon={selectedHistoryCoupon} />
                </div>
                <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: colors.primaryLight }}>
                  <div className="font-bold text-gray-800">{selectedHistoryCoupon.flavor}</div>
                  <div className="mt-1">{selectedHistoryCoupon.toppings.join(' + ')}</div>
                </div>
                <div className="grid gap-2 text-xs text-gray-500">
                  <div>Store: {selectedHistoryCoupon.storeName}</div>
                  <div>Saved: {formatDateTime(selectedHistoryCoupon.createdAt)}</div>
                  <div>Expires: {formatDateTime(selectedHistoryCoupon.expiresAt)}</div>
                  {selectedHistoryCoupon.redeemedAt ? <div>Used: {formatDateTime(selectedHistoryCoupon.redeemedAt)}</div> : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
                Tap a saved coupon to inspect its details.
              </div>
            )}
          </section>
          <StaffCouponPanel colors={colors} coupon={selectedHistoryCoupon || activeCoupon} />
        </div>
      </div>
    </div>
  );
}
