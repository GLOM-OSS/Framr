import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import Footer from '../modules/layout/footer/Footer';
import Header from '../modules/layout/header/Header';
import SideBar from '../modules/layout/sideBar/SideBar';

interface AppLayoutProps extends PropsWithChildren {}
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        height: '100%',
        backgroundColor: '#FAFAFD',
      }}
    >
      <SideBar />
      <Box sx={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
        <Header />
        <Box
          sx={{
            bgcolor: 'white',
            height: '100%',
            borderTopLeftRadius: '10px',
            padding: '16px 20px 0 20px',
          }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
