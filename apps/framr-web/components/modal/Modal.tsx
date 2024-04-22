import { PropsWithChildren } from "react";
import { Dialog } from "@mui/material";

interface modalProps extends PropsWithChildren {
    open: boolean;
    setOpen: (attr: boolean) => void;
}

export default function Modal({ open, setOpen, children }: modalProps) {
    const handleClose = () => {
        setOpen(false);
    }
    return (
        <Dialog open={open} onClose={handleClose} maxWidth={"desktop"} sx={{
            '& .MuiPaper-root': {
                borderRadius: '10px',
                display: 'grid',
                rowGap: '20px',
                width: '25rem'
            }
        }}>
            {children}
        </Dialog>
    );
}
