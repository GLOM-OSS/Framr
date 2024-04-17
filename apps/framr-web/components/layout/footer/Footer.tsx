import { Box, Typography } from "@mui/material";
import Link from 'next/link';
import ExternalLink from '@iconify-icons/fluent/open-32-regular'
import { Icon } from "@iconify/react";


export default function Footer() {
    return (
        <Box>
            <Typography>Powered by :</Typography>
            <Link
                href='#'
            >
                <Typography>
                    GLOM
                    <Icon icon={ExternalLink} />
                </Typography>
            </Link>
        </Box>
    );
}
