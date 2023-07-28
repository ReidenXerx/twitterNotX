const API = 'kdYmGXfMm4nMAfu3rSA0Yfimj'
const APIsecret = 'sbJQSgtuuMPKotYyNQfFRtEO2ByHdfmZepM2MM18D5KlE1pT0f'
import CryptoJS from 'crypto-js'

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

export enum RequestMethods {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  delete = 'DELETE',
}
interface EndpointInfo {
  full: string
  short: string
  method: RequestMethods
}
export const ApiEndpoints: { [id: string]: EndpointInfo } = {
  lookup: {
    full: 'https://api.twitter.com/1.1/statuses/lookup.json',
    short: '/lookup.json',
    method: RequestMethods.get,
  },
  update: {
    full: 'https://api.twitter.com/1.1/statuses/update.json',
    short: '/update.json',
    method: RequestMethods.post,
  },
  verifyCredentials: {
    full: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    short: '/verify_credentials.json',
    method: RequestMethods.get,
  },
  tweets: {
    full: 'https://api.twitter.com/1.1/search/tweets.json',
    short: '/tweets.json',
    method: RequestMethods.get,
  },
  userTimeline: {
    full: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
    short: '/user_timeline.json',
    method: RequestMethods.get,
  },
}

export const apiRequest = async (
  { full, short, method }: EndpointInfo,
  accessToken: string,
  accessTokenSecret: string,
) => {
  const url = full
  const httpMethod = method
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
    const response = await fetch(short, {
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
