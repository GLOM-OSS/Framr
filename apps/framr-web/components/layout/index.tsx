import { Box } from "@mui/material";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export interface layoutProps extends PropsWithChildren {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setDrawerWidth: Dispatch<SetStateAction<number>>;
    drawerWidth: number;
}
export default function Layout({ children, drawerWidth, open, setOpen, setDrawerWidth }: layoutProps) {
    return (
        <Box sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
        }}>
            <Header open={open} setOpen={setOpen} setDrawerWidth={setDrawerWidth} />
            {children}
            <Footer />
        </Box>
    );
}
