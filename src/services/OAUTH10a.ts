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

export const oauthLoginFinish = async (
  verifier: string,
  requestToken: string,
  requestTokenSecret: string,
) => {
  console.log(verifier, requestToken, requestTokenSecret, '||||||||||||||||||')
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
    Object.entries({
      ...oauthParameters,
      oauth_signature: signature,
    })
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}="${encodeURIComponent(v as string)}"`,
      )
      .join(', ')

  console.log(authHeader)

  try {
    const response = await fetch('/access_token', {
      method: httpMethod,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      //body: `oauth_verifier=${verifier}, oauth_token=${requestToken}`,
    })

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
