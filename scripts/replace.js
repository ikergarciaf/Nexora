import fs from 'fs';
import path from 'path';

function addTenantId(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  let content = fs.readFileSync(absolutePath, 'utf8');
  content = content.replace(/'Authorization':/g, "'x-tenant-id': localStorage.getItem('active_tenant_id') || '',\n        'Authorization':");
  fs.writeFileSync(absolutePath, content);
}

addTenantId('src/hooks/useDashboardData.ts');
addTenantId('src/hooks/useStaffData.ts');
addTenantId('src/pages/Dashboard.tsx');
