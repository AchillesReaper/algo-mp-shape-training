import { Alert, AlertColor, Box, Button, CircularProgress, LinearProgress, LinearProgressProps, Modal, Typography } from "@mui/material";
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const defaultTheme = createTheme();
export function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://dh3.space">
                DH3 Shore
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export const styleModalBox = {
    bgcolor: "#fff9e0",
    position: 'absolute' as 'absolute',
    overflow: 'auto',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 'md',
    width: "80%",
    height: "80%",
    borderRadius: 5,
    border: '1px solid #f6f6f6',
    boxShadow: 24,
    p: 4,
    color: '#5d13e7',
    marginTop: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}

export const styleResModl = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'transparent',
};

export const styleFormBox = {
    marginTop: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}

export const styleMainColBox = { marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', }


export const btnBox = { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', my: 2 }


export function MessageBox(props: { open: boolean, onClose: () => void, type: string, message: string }) {
    let bgColor: string = 'transparent'
    let serverity: string = 'info'
    switch (props.type) {
        case 'info':
            bgColor = 'info.main'
            serverity = 'info'
            break;
        case 'success':
            bgColor = 'success.main'
            serverity = 'success'
            break;
        case 'error':
            bgColor = 'error.main'
            serverity = 'error'
            break;
        default:
            break;
    }
    const syleBox = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: bgColor,
        boxShadow: 24,
        p: 1,
    }
    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={syleBox}>
                <Alert variant="filled" severity={serverity as AlertColor}>{props.message}</Alert>
                <Box sx={btnBox}><Button variant="contained" onClick={props.onClose}>ok</Button></Box>
            </Box>
        </Modal>
    )

}

export function LoadingBox(props: { open: boolean, onClose: () => void }) {
    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={styleResModl}>
                <CircularProgress size={'6rem'}/>
            </Box>
        </Modal>
    )
}

export function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ minWidth: 80 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >Completion</Typography>
      </Box>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }