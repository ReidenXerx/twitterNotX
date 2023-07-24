import { RequestMethods } from '../constants'
import { API, APIsecret } from './keys.json'
import CryptoJS from 'crypto-js'

export const oauthLogin = async () => {
  const generateOAuthSignature = (
    httpMethod: string,
    baseUrl: string,
    oauthParams: { [key: string]: string },
    requestParams: { [key: string]: string },
    consumerSecret: string,
    tokenSecret: string,
  ) => {
    // Step 1: Combine Parameters
    const combinedParams = Object.assign({}, oauthParams, requestParams)
    const sortedParams = Object.keys(combinedParams)
      .sort()
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            combinedParams[key],
          )}`,
      )
      .join('&')

    // Step 2: Generate Base String
    const baseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(
      baseUrl,
    )}&${encodeURIComponent(sortedParams)}`

    // Step 3: Generate Signing Key
    const signingKey = `${encodeURIComponent(
      consumerSecret,
    )}&${encodeURIComponent(tokenSecret)}`

    // Step 4: Generate Signature
    const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(
      CryptoJS.enc.Base64,
    )

    // Step 5: URL Encode Signature
    const urlEncodedSignature = encodeURIComponent(signature)

    return urlEncodedSignature
  }
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
  //oauthParameters['oauth_signature']
  // Sort the parameters by their field name
  const sortedParameters: { [key: string]: string } = Object.keys(
    oauthParameters,
  )
    .sort()
    .reduce((obj: { [key: string]: string }, key: string) => {
      obj[key] = oauthParameters[key]
      return obj
    }, {})

  // Form the parameter string
  const parameterString = Object.keys(sortedParameters)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        sortedParameters[key],
      )}`
    })
    .join('&')

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

  fetch('/request_token', {
    method: httpMethod,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => response.text())
    .then((data) => console.log('DATA, ' + data))
    .catch((err) => console.log('ERR, ' + err))
}
