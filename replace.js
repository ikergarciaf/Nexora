import fs from 'fs';

function addTenantId(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'Authorization':/g, "'x-tenant-id': localStorage.getItem('active_tenant_id') || '',\n        'Authorization':");
  fs.writeFileSync(filePath, content);
}

addTenantId('src/hooks/useDashboardData.ts');
addTenantId('src/hooks/useStaffData.ts');
addTenantId('src/pages/Dashboard.tsx');
