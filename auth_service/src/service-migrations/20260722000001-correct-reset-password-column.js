'use strict';
export default {
  async up(q, S) { await q.renameColumn('users', 'reset_password_expires', 'reset_password_expire'); },
  async down(q, S) { await q.renameColumn('users', 'reset_password_expire', 'reset_password_expires'); },
};
