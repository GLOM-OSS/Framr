import { useEffect, useState } from 'react';
import ToolManagement from '../../../lib/modules/tools/ToolManagement';

export default function Index() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient && <ToolManagement />;
}
