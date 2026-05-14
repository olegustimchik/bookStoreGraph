export const getEnvOrDefault = <T>(varName: string, defaultValue: T): T =>
  varName in process.env ? (process.env[varName] as unknown as T) : defaultValue;