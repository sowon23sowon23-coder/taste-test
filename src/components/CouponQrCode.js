import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export function CouponQrCode({ value, colors }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const link = document.createElement('a');
      link.href = canvasRef.current.toDataURL('image/png');
      link.download = 'yogurtland-coupon-qr.png';
      link.click();
    } catch (downloadError) {
      console.error(downloadError);
      setError('QR download could not be generated.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const renderCode = async () => {
      if (!canvasRef.current || !value) return;

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          margin: 1,
          width: 180,
          color: {
            dark: colors.primaryDark,
            light: '#ffffff'
          }
        });
        if (isMounted) setError('');
      } catch (renderError) {
        console.error(renderError);
        if (isMounted) setError('QR preview could not be generated.');
      }
    };

    renderCode();

    return () => {
      isMounted = false;
    };
  }, [colors.primaryDark, value]);

  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 text-center shadow-sm md:rounded-3xl">
      <div className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: colors.primary }}>
        Scan In Store
      </div>
      <div className="mt-4 flex justify-center">
        <canvas ref={canvasRef} className="rounded-2xl" />
      </div>
      {error ? (
        <div className="mt-3 text-sm text-red-600">{error}</div>
      ) : (
        <>
          <div className="mt-3 text-xs leading-5 text-gray-500">
            Staff can scan or reference this QR with your coupon code.
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
          >
            Download QR
          </button>
        </>
      )}
    </div>
  );
}
