import { Box, Collapse, Typography } from '@mui/material';
import NavItem from './NavItem';
import { SideBarSection as ISideBarSection } from './SideBar';

interface SideBarSectionProps extends ISideBarSection {
  isOpen: boolean;
}
export default function NavBarSection({
  navItems,
  title,
  isOpen,
}: SideBarSectionProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: isOpen ? 1.5 : 0,
      }}
    >
      <Typography
        component={Collapse}
        in={isOpen}
        orientation="horizontal"
        variant="body2"
        sx={{ textTransform: 'uppercase', fontWeight: '500' }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'grid', rowGap: 2 }}>
        {navItems.map((item, index) => (
          <NavItem isOpen={isOpen} item={item} key={index} />
        ))}
      </Box>
    </Box>
  );
}
