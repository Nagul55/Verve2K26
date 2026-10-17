import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const youpiRoot = path.resolve(__dirname, '../youpi-pg');

process.env.YOUPI_MODE = 'localhost';
process.env.NODE_ENV = 'development';
process.env.USE_SQLITE_FALLBACK = 'true';
process.env.SQLITE_DB_PATH = path.resolve(youpiRoot, 'data/youpi_pg.sqlite');
process.env.PAYMENT_API_PORT = '6100';
process.env.CHECKOUT_PORTAL_PORT = '7000';
process.env.BASE_PAYMENT_API_URL = 'http://localhost:6100';
process.env.BASE_CHECKOUT_URL = 'http://localhost:7000';

async function main() {
  console.log('====================================================');
  console.log('⚡ Starting YouPI-PG Local Sovereign Gateway for Eventrix');
  console.log('====================================================');

  const apiEntry = pathToFileURL(path.resolve(youpiRoot, 'apps/payment-api/src/index.js')).href;
  const checkoutEntry = pathToFileURL(path.resolve(youpiRoot, 'apps/checkout-portal/src/index.js')).href;

  const { startServer: startApi } = await import(apiEntry);
  const { startCheckoutServer } = await import(checkoutEntry);

  const api = await startApi(6100);
  const checkout = await startCheckoutServer(7000);

  console.log('====================================================');
  console.log('🟢 YouPI-PG Services Running:');
  console.log('• Payment API:     http://localhost:6100');
  console.log('• Checkout Portal: http://localhost:7000');
  console.log('====================================================');

  const cleanup = async () => {
    console.log('\nShutting down YouPI-PG...');
    await api.close();
    await checkout.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(err => {
  console.error('Failed to start YouPI-PG:', err);
  process.exit(1);
});
