export const SERVICE_UUID      = '4fafc201-1fb5-459e-8fcc-c5c9c3319100';
export const STATUS_UUID       = '4fafc201-1fb5-459e-8fcc-c5c9c3319101';
export const SCHEDULE_UUID     = '4fafc201-1fb5-459e-8fcc-c5c9c3319102';
export const FOOD_AMOUNT_UUID  = '4fafc201-1fb5-459e-8fcc-c5c9c3319103';
export const MANUAL_FEED_UUID  = '4fafc201-1fb5-459e-8fcc-c5c9c3319104';
export const CLOCK_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c3319105';

export function bytesToBase64(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToBytes(base64: string): number[] {
  return Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export function lidarToPercent(mm: number): number {
  if (mm < 0) return 0;
  const clamped = Math.min(mm, 400);
  return Math.round(100 - (clamped * 100) / 400);
}
