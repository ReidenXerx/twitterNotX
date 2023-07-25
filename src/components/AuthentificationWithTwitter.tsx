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
import { oauthLogin, oauthLoginFinish } from '../services/OAUTH10a'

export const AuthentificationWithTwitter = () => {
  const [verifier, setVerifier] = useState('')
  const [requestData, setRequestData] = useState<{ [key: string]: string }>({})
  const [openError, setOpenError] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [alertText, setAlertText] = useState('')

  const handleSubmit = async () => {
    try {
      setRequestData(await oauthLogin())
      setAlertText(`Request tickets obtained! ${JSON.stringify(requestData)}`)
      setOpenSuccess(true)
      setOpenError(false)
      window.open(
        `https://api.twitter.com/oauth/authorize?oauth_token=${requestData.oauth_token}`,
        '_blanc',
      )
    } catch (error) {
      setAlertText(`Error when obtainig request token! ${error}`)
      setOpenError(true)
      setOpenSuccess(false)
    }
  }

  const handleVerifier = async () => {
    try {
      const result = await oauthLoginFinish(
        verifier,
        requestData.oauth_token,
        requestData.oauth_token_secret,
      )
      setAlertText(`Access tickets obtained! ${JSON.stringify(result)}`)
      setOpenSuccess(true)
      setOpenError(false)
    } catch (error) {
      setAlertText(`Error when obtainig access token! ${error}`)
      setOpenError(true)
      setOpenSuccess(false)
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
          <Alert severity="error">{alertText}</Alert>
        </Collapse>
        <Collapse in={openSuccess}>
          <Alert severity="success">{alertText}</Alert>
        </Collapse>
      </Stack>
    </Box>
  )
}
