import { SHAKE_THRESHOLD, SHAKE_COOLDOWN } from './constants';

type ShakeCallback = () => void;

/**
 * DeviceMotion 摇一摇检测器
 * 桌面端自动降级（不监听，由按钮触发）
 */
export class ShakeDetector {
  private lastShakeTime = 0;
  private callback: ShakeCallback | null = null;
  private listening = false;

  /** 是否需要 iOS 13+ 权限请求 */
  static needsPermission(): boolean {
    return (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    );
  }

  /** iOS 13+ 请求权限 */
  static async requestPermission(): Promise<boolean> {
    if (!ShakeDetector.needsPermission()) return true;
    try {
      const resp = await (DeviceMotionEvent as any).requestPermission();
      return resp === 'granted';
    } catch {
      return false;
    }
  }

  /** 开始监听 */
  start(onShake: ShakeCallback): void {
    if (this.listening) return;
    this.callback = onShake;

    // 桌面端不监听（模拟器无传感器）
    if (this.isDesktop()) return;

    this.listening = true;
    window.addEventListener('devicemotion', this.handleMotion);
  }

  /** 停止监听 */
  stop(): void {
    if (!this.listening) return;
    this.listening = false;
    window.removeEventListener('devicemotion', this.handleMotion);
    this.callback = null;
  }

  /** 是否桌面端 */
  isDesktop(): boolean {
    return !('ontouchstart' in window) && !navigator.maxTouchPoints;
  }

  private handleMotion = (e: DeviceMotionEvent): void => {
    const acc = e.accelerationIncludingGravity;
    if (!acc || !acc.x || !acc.y || !acc.z) return;

    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const now = Date.now();

    if (magnitude > SHAKE_THRESHOLD && now - this.lastShakeTime > SHAKE_COOLDOWN) {
      this.lastShakeTime = now;
      this.callback?.();
    }
  };
}
