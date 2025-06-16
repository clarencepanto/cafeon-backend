/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("sales").del();

  await knex("sales").insert([
    {
      id: 1,
      total: 9.0,
      customer_id: 1,
      created_at: knex.fn.now(),
    },
    {
      id: 2,
      total: 13.5,
      customer_id: 2,
      created_at: knex.raw(`NOW() - INTERVAL 1 DAY`),
    },
    {
      id: 3,
      total: 8.0,
      customer_id: null,
      created_at: knex.raw(`NOW() - INTERVAL 2 DAY`),
    },
  ]);
};
