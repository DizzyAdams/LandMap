const { execSync } = require('child_process');
console.log('Deploying via vercel...');
try {
  execSync('npx vercel deploy --prod --yes', { stdio: 'inherit', shell: true });
} catch (e) {
  console.error('Failed to deploy', e);
  process.exit(1);
}
