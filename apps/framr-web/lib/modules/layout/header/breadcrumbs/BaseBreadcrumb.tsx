import { Breadcrumbs, Link } from '@mui/material';

interface BaseBreadcrumbItem {
  href: string;
  title: string;
}
interface BaseBreadcrumbProps {
  breadcrumbs: BaseBreadcrumbItem[];
}
export default function BaseBreadcrumb({
  breadcrumbs,
}: BaseBreadcrumbProps) {
  return (
    <Breadcrumbs>
      {breadcrumbs.map(({ href, title }, index) => (
        <Link
          key={index}
          variant="body2"
          underline="hover"
          color="primary"
          href={href}
        >
          {title}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
