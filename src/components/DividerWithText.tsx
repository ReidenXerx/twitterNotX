import { Box, Divider, Typography } from '@mui/material'

export interface IDividerWithTextProps {
  text: string
}

export function DividerWithText({ text }: IDividerWithTextProps) {
  return (
    <Box>
      <Divider />
      <Typography variant="body1" style={{ margin: '0 16px' }}>
        {text}
      </Typography>
      <Divider />
    </Box>
  )
}
