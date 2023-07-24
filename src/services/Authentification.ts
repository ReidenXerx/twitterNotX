import { RequestMethods } from '../constants'
import { API, APIsecret } from './keys.json'
import { Buffer } from 'buffer'
import CryptoJS from 'crypto-js'
import { HMACSHA1 } from '../SHA1'

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

export const getSignature = async (baseString: string, key: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(baseString)
  const keyData = encoder.encode(key)

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, data)

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const oauthLogin = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = Math.random().toString(36).substring(2)

  const parameters = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
    oauth_signature: '',
  }

  const signatureBaseString =
    'POST&' +
    encodeURIComponent('/request_token') +
    '&' +
    Object.entries(parameters)
      .sort()
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('%26')
  const signingKey = encodeURIComponent(apiSecretKey) + '&'
  const signature1 = btoa(CryptoJS.HmacSHA1(signatureBaseString, signingKey))
  const signature2 = await getSignature(signatureBaseString, signingKey)
  const signature3 = HMACSHA1(signatureBaseString, signingKey)

  console.log(signature1, ' |||| ', signature2, ' |||| ', signature3)

  parameters['oauth_signature'] = signature3

  const authHeader =
    'OAuth ' +
    Object.entries(parameters)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ')

  fetch('/request_token', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => response.text())
    .then((data) => console.log('DATA, ' + data))
    .catch((err) => console.log('ERR, ' + err))
}
