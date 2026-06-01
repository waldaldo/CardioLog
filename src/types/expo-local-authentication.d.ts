declare module 'expo-local-authentication' {
  export async function hasHardwareAsync(): Promise<boolean>;
  export async function isEnrolledAsync(): Promise<boolean>;
  export async function authenticateAsync(options?: {
    promptMessage?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<{ success: boolean }>;
}
