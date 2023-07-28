import { useState } from 'react'
import {
  TextField,
  Checkbox,
  Button,
  Stack,
  Typography,
  Divider,
  SvgIcon,
  FormControlLabel,
  Link,
  Box,
} from '@mui/material'
import { Google } from '@mui/icons-material'
import { ApiEndpoints, apiRequest } from '../services/twitterRequester'
import { useAsyncEffect } from '../services/useAsyncEffect'

export function Authentification() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log(`User ${username} with ${password}`)
  }

  useAsyncEffect(async () => {
    const access = '1671546374440067072-LopcIl3xhEPExVapXnc0nSBPsqmLxx'
    const accessSecret = '2pjBikh74Z0mVK9ifMVJkxOfTGaOju2oMJlsKMbCzn9bP'
    const result1 = await apiRequest(
      ApiEndpoints['verifyCredentials'],
      access,
      accessSecret,
    )
    console.log(JSON.stringify(result1))
    const result2 = await apiRequest(
      ApiEndpoints['lookup'],
      access,
      accessSecret,
    )
    console.log(JSON.stringify(result2))
    const result3 = await apiRequest(
      ApiEndpoints['update'],
      access,
      accessSecret,
    )
    console.log(JSON.stringify(result3))
    const result4 = await apiRequest(
      ApiEndpoints['tweets'],
      access,
      accessSecret,
    )
    console.log(JSON.stringify(result4))
    const result5 = await apiRequest(
      ApiEndpoints['userTimeline'],
      access,
      accessSecret,
    )
    console.log(JSON.stringify(result5))
  }, [])
  return (
    <form onSubmit={handleSubmit}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="90vh"
      >
        <Stack width="360px" alignItems="center">
          <Typography variant="h5" mb="20px" fontWeight="bold">
            Log in to your account
          </Typography>
          <Button
            type="submit"
            variant="outlined"
            size="large"
            fullWidth
            endIcon={<SvgIcon component={Google} />}
            sx={{
              marginBottom: '20px',
              fontWeight: 'bold',
              border: '1px solid',
            }}
          >
            Login with Google
          </Button>
          <Divider sx={{ width: '100%' }}>
            <Typography textTransform="uppercase" color="GrayText">
              or
            </Typography>
          </Divider>
          <TextField
            label="Username/Email"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            sx={{ alignSelf: 'flex-start' }}
            control={<Checkbox color="primary" />}
            label="Remember Me"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ marginTop: '20px' }}
          >
            Log In
          </Button>
          <Button
            variant="text"
            color="primary"
            size="small"
            sx={{
              textTransform: 'capitalize',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Forgot your password?
          </Button>
          <Divider sx={{ width: '100%', marginBottom: '20px' }} />
          <Typography>
            Don`t have an account?{' '}
            <Link underline="none" sx={{ cursor: 'pointer' }}>
              Register
            </Link>{' '}
          </Typography>
        </Stack>
      </Box>
    </form>
  )
}
