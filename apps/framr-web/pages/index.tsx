import { Box } from '@mui/material';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';
import SideBar from '../components/layout/sideBar/SideBar';

export function Index() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        height: '100svh',
      }}
    >
      <SideBar />
      <Box sx={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
        <Header />
        <Box sx={{ bgcolor: 'black', height: '100%' }}>Hello</Box>
        <Footer />
      </Box>
    </Box>
  );
}

export default Index;
