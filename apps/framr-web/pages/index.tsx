import { Box } from "@mui/material";
import SideBar from "../components/sideBar/SideBar";
import Layout from "../components/layout";
import { useState } from "react";
import ToolManagement from "../components/ToolManagement/ToolManagement";

export function Index() {
  const [open, setOpen] = useState<boolean>(true)
  const [drawerWidth, setDrawerWidth] = useState<number>(240)

  return (
    <Box sx={{
      display: "flex",
    }}>
      <Layout
        drawerWidth={drawerWidth}
        setDrawerWidth={setDrawerWidth}
        open={open}
        setOpen={setOpen}
      >
        <ToolManagement />
      </Layout>
      <SideBar
        drawerWidth={drawerWidth}
        setDrawerWidth={setDrawerWidth}
        open={open}
        setOpen={setOpen} />
    </Box>
  );
}

export default Index;
