import { isSupabaseConfigured, supabase } from '../lib/supabase';

const LOCAL_KEY = 'savedCoupons';
const COUPON_EXPIRY_HOURS = 72;

const buildExpiryDate = (createdAt) => {
  const expiresAt = new Date(createdAt);
  expiresAt.setHours(expiresAt.getHours() + COUPON_EXPIRY_HOURS);
  return expiresAt.toISOString();
};

const mapCouponRow = (row) => ({
  id: row.id,
  code: row.code,
  flavor: row.flavor,
  toppings: row.toppings || [],
  storeName: row.store_name ?? row.storeName,
  status: row.status ?? 'saved',
  createdAt: row.created_at ?? row.createdAt,
  expiresAt: row.expires_at ?? row.expiresAt,
  redeemedAt: row.redeemed_at ?? row.redeemedAt ?? null
});

const readLocalCoupons = () => {
  const saved = localStorage.getItem(LOCAL_KEY);
  return (saved ? JSON.parse(saved) : []).map((coupon) => ({
    ...coupon,
    status: coupon.status || 'saved',
    expiresAt: coupon.expiresAt || buildExpiryDate(coupon.createdAt || new Date().toISOString()),
    redeemedAt: coupon.redeemedAt || null
  }));
};

const writeLocalCoupons = (coupons) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(coupons));
};

export async function saveCoupon(coupon) {
  const createdAt = new Date().toISOString();
  const payload = {
    code: coupon.code,
    flavor: coupon.flavor,
    toppings: coupon.toppings || [],
    store_name: coupon.storeName,
    status: 'saved',
    created_at: createdAt,
    expires_at: buildExpiryDate(createdAt),
    redeemed_at: null
  };

  if (!isSupabaseConfigured) {
    const nextCoupon = {
      id: `coupon-${Date.now()}`,
      code: coupon.code,
      flavor: coupon.flavor,
      toppings: coupon.toppings || [],
      storeName: coupon.storeName,
      status: payload.status,
      createdAt: payload.created_at,
      expiresAt: payload.expires_at,
      redeemedAt: payload.redeemed_at
    };
    writeLocalCoupons([nextCoupon, ...readLocalCoupons()]);
    return nextCoupon;
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .insert(payload)
    .select('id,code,flavor,toppings,store_name,status,created_at,expires_at,redeemed_at')
    .single();

  if (error) {
    console.error('Failed to save coupon:', error);
    throw error;
  }

  return mapCouponRow(data);
}

export async function listSavedCoupons() {
  if (!isSupabaseConfigured) {
    return readLocalCoupons();
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .select('id,code,flavor,toppings,store_name,status,created_at,expires_at,redeemed_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load coupon history:', error);
    throw error;
  }

  return data.map(mapCouponRow);
}

export async function redeemCoupon(couponId) {
  const redeemedAt = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const nextCoupons = readLocalCoupons().map((coupon) =>
      coupon.id === couponId
        ? { ...coupon, status: 'redeemed', redeemedAt }
        : coupon
    );
    writeLocalCoupons(nextCoupons);
    return nextCoupons.find((coupon) => coupon.id === couponId) || null;
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .update({ status: 'redeemed', redeemed_at: redeemedAt })
    .eq('id', couponId)
    .select('id,code,flavor,toppings,store_name,status,created_at,expires_at,redeemed_at')
    .single();

  if (error) {
    console.error('Failed to redeem coupon:', error);
    throw error;
  }

  return mapCouponRow(data);
}
