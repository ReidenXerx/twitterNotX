export const objectToKeyValueArray = (obj: { [key: string]: string }) => {
  return Object.entries(obj).map(([key, value]) => `${key}=${value}\n`)
}
