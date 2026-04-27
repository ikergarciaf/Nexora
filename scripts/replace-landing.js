import fs from 'fs';
import path from 'path';

function replaceDashboardWithLogin(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  let content = fs.readFileSync(absolutePath, 'utf8');
  content = content.replace(/navigate\('\/dashboard'\)/g, "navigate('/login')");
  fs.writeFileSync(absolutePath, content);
}

replaceDashboardWithLogin('src/pages/LandingPage.tsx');
