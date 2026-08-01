const DEVICE_ID_KEY = 'nutrihogar.inventory.device-id';

export function getInventoryDeviceId(): string {
  try {
    const current = globalThis.localStorage?.getItem(DEVICE_ID_KEY);
    if (current) return current;
    const deviceId = crypto.randomUUID();
    globalThis.localStorage?.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch {
    return 'browser-device';
  }
}
