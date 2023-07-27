import { RequestMethods } from '../constants'

type RequestParams = {
  method: RequestMethods
  headers?: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any> | null
}

export const fetchRequest = async <ReturnType>(
  url: string,
  { method, headers = {}, body = null }: RequestParams,
): Promise<ReturnType> => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error('There was an error with your request', error)
    throw error
  }
}
