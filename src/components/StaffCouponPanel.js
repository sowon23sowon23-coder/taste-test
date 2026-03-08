import React from 'react';
import { ClipboardCheck, MapPin, Ticket } from 'lucide-react';
import { CouponStatusBadge } from './CouponStatusBadge';

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

export function StaffCouponPanel({ colors, coupon }) {
  return (
    <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm md:rounded-3xl">
      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
        <ClipboardCheck className="h-4 w-4" />
        Staff Check View
      </div>
      {coupon ? (
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.paper }}>
            <div className="font-bold text-gray-800">{coupon.code}</div>
            <CouponStatusBadge coupon={coupon} />
          </div>
          <div className="flex items-start gap-2">
            <Ticket className="mt-0.5 h-4 w-4" style={{ color: colors.primary }} />
            <div>{coupon.flavor} + {coupon.toppings.join(' + ')}</div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4" style={{ color: colors.primary }} />
            <div>{coupon.storeName}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
            Saved {formatDateTime(coupon.createdAt)}
            <br />
            Valid until {formatDateTime(coupon.expiresAt)}
            {coupon.redeemedAt ? (
              <>
                <br />
                Used {formatDateTime(coupon.redeemedAt)}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
          Save a coupon first to open a staff-ready verification view.
        </div>
      )}
    </section>
  );
}
