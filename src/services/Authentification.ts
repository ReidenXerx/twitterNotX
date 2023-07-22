import { RequestMethods } from '../constants'
import { API, APIsecret, access, accessSecret } from './keys.json'
import { Buffer } from 'buffer'
import OAuth from 'oauth-1.0a'

const apiKey = API
const apiSecretKey = APIsecret
const accessKey = access
const accessSecretKey = accessSecret

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

export const oauthLogin = async () => {
  const twitterOAuth = new OAuth({
    consumer: {
      key: accessKey,
      secret: accessSecretKey,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.subtle
        .importKey('raw', new TextEncoder().encode(key), 'HMAC', false, [
          'sign',
        ])
        .then((cryptoKey) =>
          crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            new TextEncoder().encode(base_string),
          ),
        )
        .then((arrayBuffer) => {
          const byteArray = new Uint8Array(arrayBuffer)
          const hexCodes = [...byteArray].map((value) =>
            `00${value.toString(16)}`.slice(-2),
          )
          return hexCodes.join('')
        })
    },
  })

  const request_data = {
    url: '/token',
    method: RequestMethods.post,
  }

  fetch(request_data.url, {
    method: request_data.method,
    headers: {
      Authorization: twitterOAuth.toHeader(twitterOAuth.authorize(request_data))
        .Authorization,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
    .then((response) => response.text())
    .then((response) => {
      console.log(response)
      // Parse the response (response contains request tokens)
      // Redirect the user to the Twitter authorization page with the request tokens
    })
    .catch((error) => console.error('Error:', error))
}
