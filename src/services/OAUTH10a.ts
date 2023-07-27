import { RequestMethods } from '../constants'
import { API, APIsecret } from './keys.json'
import CryptoJS from 'crypto-js'

const parseOAuthResponse = (responseString: string) => {
  const keyValuePairs = new URLSearchParams(responseString)
  console.log(keyValuePairs)
  const oauthObject: { [key: string]: string } = {}

  for (const [key, value] of keyValuePairs.entries()) {
    oauthObject[key] = value
  }
  return oauthObject
}

const sortParams = (unsorted: { [key: string]: string }) => {
  return Object.keys(unsorted)
    .sort()
    .reduce((obj: { [key: string]: string }, key: string) => {
      obj[key] = unsorted[key]
      return obj
    }, {})
}

const formParameterString = (parameters: { [key: string]: string }) => {
  return Object.keys(parameters)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`
    })
    .join('&') as string
}
/*
 * First step of OAUTH 1.0a authenification.
 * Returns request token required for second step with redirecting to Twitter
 */
export const oauthLogin = async () => {
  const httpMethod = RequestMethods.post
  const url = 'https://api.twitter.com/oauth/request_token'
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = Math.random().toString(36).substring(2)
  const api = API
  const apiSecret = APIsecret
  const oauthParameters: { [key: string]: string } = {
    oauth_consumer_key: api,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(timestamp),
    oauth_version: '1.0',
  }
  // Sort the parameters by their field name
  const sortedParameters: { [key: string]: string } =
    sortParams(oauthParameters)

  // Form the parameter string
  const parameterString = formParameterString(sortedParameters)

  // Form the signature base string
  const signatureBaseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(
    url,
  )}&${encodeURIComponent(parameterString)}`

  // Form the signing key
  const signingKey = `${encodeURIComponent(apiSecret)}&`

  // Generate the signature using HMAC-SHA1
  const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey).toString(
    CryptoJS.enc.Base64,
  )
  const authHeader =
    'OAuth ' +
    Object.entries({ ...oauthParameters, oauth_signature: signature })
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}="${encodeURIComponent(v as string)}"`,
      )
      .join(', ')

  try {
    const response = await fetch('/request_token', {
      method: httpMethod,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      throw new Error('Network response was not ok.')
    }
    return parseOAuthResponse(await response.text())
  } catch (err) {
    console.log('ERR', err)
    throw err // Rethrow the error to be caught by the caller if necessary.
  }
}
/*
 * Third step of OAUTH 1.0a authenification.
 * Returns access token required for authentification of user
 */
export const oauthLoginFinish = async (
  verifier: string,
  requestToken: string,
  requestTokenSecret: string,
) => {
  const httpMethod = RequestMethods.post
  const url = 'https://api.twitter.com/oauth/access_token'
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = Math.random().toString(36).substring(2)
  const api = API
  const apiSecret = APIsecret
  const oauthParameters: { [key: string]: string } = {
    oauth_consumer_key: api,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(timestamp),
    oauth_version: '1.0',
    oauth_token: requestToken,
    oauth_verifier: verifier,
  }
  // Sort the parameters by their field name
  const sortedParameters: { [key: string]: string } =
    sortParams(oauthParameters)

  // Form the parameter string
  const parameterString = formParameterString(sortedParameters)

  // Form the signature base string
  const signatureBaseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(
    url,
  )}&${encodeURIComponent(parameterString)}`

  // Form the signing key
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(
    requestTokenSecret,
  )}&`

  // Generate the signature using HMAC-SHA1
  const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey).toString(
    CryptoJS.enc.Base64,
  )
  const authHeader =
    'OAuth ' +
    Object.entries(
      sortParams({
        ...sortedParameters,
        oauth_signature: signature,
      }),
    )
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}="${encodeURIComponent(v as string)}"`,
      )
      .join(', ')

  console.log(authHeader)

  try {
    const response = await fetch(
      `/access_token?oauth_token=${requestToken}&oauth_verifier=${verifier}`,
      {
        method: httpMethod,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `Network response was not ok. Additional data: ${response.status} HTTP error, Header: ${authHeader}`,
      )
    }
    return parseOAuthResponse(await response.text())
  } catch (err) {
    console.log('ERR', err)
    throw err // Rethrow the error to be caught by the caller if necessary.
  }
}
/*
 * Check of access tokens returned on previous step
 * Returns user information
 */
export const verifyCredentials = async (
  accessToken: string,
  accessTokenSecret: string,
) => {
  const url = 'https://api.twitter.com/1.1/account/verify_credentials.json'
  const httpMethod = RequestMethods.get
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = Math.random().toString(36).substring(2)
  const api = API
  const apiSecret = APIsecret
  const oauthParameters = {
    oauth_consumer_key: api,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(timestamp),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  // Sort the parameters by their field name
  const sortedParameters: { [key: string]: string } =
    sortParams(oauthParameters)

  // Form the parameter string
  const parameterString = formParameterString(sortedParameters)

  const signatureBaseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(
    url,
  )}&${encodeURIComponent(parameterString)}`
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(
    accessTokenSecret,
  )}`

  const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey).toString(
    CryptoJS.enc.Base64,
  )
  const authHeader = `OAuth ${Object.entries({
    ...sortedParameters,
    oauth_signature: signature,
  })
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ')}`

  try {
    const response = await fetch('/verify_credentials.json', {
      method: httpMethod,
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(
        `HTTP Error Response: ${response.status} ${response.statusText}`,
      )
    }

    return await response.json()
  } catch (err) {
    console.error('Error:', err)
  }
}
