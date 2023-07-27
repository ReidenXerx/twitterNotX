import { useState } from 'react'
import {
  TextField,
  Button,
  Stack,
  SvgIcon,
  Box,
  Alert,
  Collapse,
} from '@mui/material'
import TwitterIcon from '@mui/icons-material/Twitter'
import {
  oauthLogin,
  oauthLoginFinish,
  verifyCredentials,
} from '../services/OAUTH10a'
import { objectToKeyValueArray } from '../util'

export const AuthentificationWithTwitter = () => {
  const [verifier, setVerifier] = useState('')
  const [requestData, setRequestData] = useState<{ [key: string]: string }>({})
  const [openError, setOpenError] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [alertSuccessText, setAlertSuccessText] = useState('')
  const [alertErrorText, setAlertErrorText] = useState('')

  const handleSubmit = async () => {
    try {
      const result = await oauthLogin()
      setRequestData(result)
      setAlertSuccessText(
        `Request token obtained! ${objectToKeyValueArray(result)}`,
      )
      setOpenSuccess(true)
      window.open(
        `https://api.twitter.com/oauth/authorize?oauth_token=${result.oauth_token}`,
        '_blanc',
      )
    } catch (error) {
      setAlertErrorText(`Error when obtainig request token! ${error}`)
      setOpenError(true)
    }
  }

  const handleVerifier = async () => {
    try {
      const result = await oauthLoginFinish(
        verifier,
        requestData.oauth_token,
        requestData.oauth_token_secret,
      )
      setAlertSuccessText(
        `Access tickets obtained! ${objectToKeyValueArray(result)}`,
      )
      setOpenSuccess(true)
      setTimeout(async () => {
        const user = await verifyCredentials(
          result.oauth_token,
          result.oauth_token_secret,
        )
        setAlertSuccessText(
          `User Data acquired! ${objectToKeyValueArray(user)}`,
        )
        setOpenSuccess(true)
      }, 1000)
    } catch (error) {
      setAlertErrorText(`Error when obtainig access token! ${error}`)
      setOpenError(true)
    }
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="90vh"
    >
      <Stack width="360px" alignItems="center">
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          endIcon={<SvgIcon component={TwitterIcon} />}
          sx={{ marginTop: '20px' }}
        >
          Log In with Twitter
        </Button>
        <TextField
          label="Verifier"
          variant="outlined"
          value={verifier}
          onChange={(e) => setVerifier(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          onClick={handleVerifier}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={!verifier}
          sx={{ marginTop: '20px', marginBottom: '20px' }}
        >
          Verify
        </Button>
        <Collapse in={openError}>
          <Alert severity="error">{alertErrorText}</Alert>
        </Collapse>
        <Collapse in={openSuccess}>
          <Alert severity="success">{alertSuccessText}</Alert>
        </Collapse>
      </Stack>
    </Box>
  )
}
