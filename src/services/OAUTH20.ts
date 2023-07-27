import { RequestMethods } from '../constants'
import { API, APIsecret } from './keys.json'
import { Buffer } from 'buffer'

const apiKey = API
const apiSecretKey = APIsecret

// Step 1: Obtain a bearer token
export const getBearerToken = async (): Promise<string> => {
  const response = await fetch('/bearer', {
    method: RequestMethods.post,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${apiKey}:${apiSecretKey}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })

  const { access_token } = await response.json()
  return access_token
}

// Step 2: Use the bearer token to authenticate API requests
export const getUser = async (
  userId: string,
  bearerToken: string,
): Promise<unknown> => {
  try {
    const response = await fetch(`users/${userId}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
