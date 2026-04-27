import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/LandingPage.tsx',
  'src/pages/SpecialtyLanding.tsx',
  'src/components/FrontendNavbar.tsx'
];

for (const file of files) {
  const absolutePath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(absolutePath, 'utf8');
  content = content.replace(/navigate\('\/login(.*?)'\)/g, "navigate('/dashboard$1')");
  content = content.replace(/navigate\(`\/login(.*?)`\)/g, "navigate(`/dashboard$1`)");
  fs.writeFileSync(absolutePath, content);
}
