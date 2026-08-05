'use strict';

import { randomUUID } from 'crypto';

const CMS_PAGES = [
  { title: 'About Us', content: 'Loyalty Program About page content.' },
  { title: 'Terms & Conditions', content: 'Terms and conditions for the loyalty program.' },
  { title: 'Privacy Policy', content: 'Privacy policy for the loyalty program.' },
  { title: 'Contact Us', content: 'Contact information for the support team.' },
  { title: 'FAQ', content: 'Frequently asked questions about the loyalty program.' },
];

/** Seed the base CMS pages used by the admin panel. */
export async function up(queryInterface) {
  const [existingPages] = await queryInterface.sequelize.query(
    'SELECT title FROM cms WHERE title IN (:titles)',
    { replacements: { titles: CMS_PAGES.map((page) => page.title) } }
  );
  const existingTitles = new Set(existingPages.map((page) => page.title));
  const now = new Date();
  const pagesToInsert = CMS_PAGES
    .filter((page) => !existingTitles.has(page.title))
    .map((page) => ({
      uuid: randomUUID(),
      ...page,
      status: 'active',
      created_at: now,
      updated_at: now,
    }));

  if (pagesToInsert.length) {
    await queryInterface.bulkInsert('cms', pagesToInsert);
  }
}

/** Remove only the CMS pages created by this seeder. */
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('cms', {
    title: { [Sequelize.Op.in]: CMS_PAGES.map((page) => page.title) },
  });
}
