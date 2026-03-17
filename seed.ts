/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from '@snaplet/seed';
import bcrypt from 'bcryptjs';

const main = async () => {
  const seed = await createSeedClient({ dryRun: true });

  await seed.$resetDatabase();

  const encryptedPassword = await bcrypt.hash('test123', 10);

  await seed.users([
    {
      email: 'pr_test@example.com',
      encrypted_password: encryptedPassword,
      email_confirmed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      raw_app_meta_data: { provider: 'email', providers: ['email'] },
      raw_user_meta_data: {},
    },
  ]);

  process.exit();
};

main();
