/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("sale_items").del();

  await knex("sale_items").insert([
    // Sale 1: Clarence
    { sale_id: 1, product_id: 1, quantity: 1, price: 3.0 },
    { sale_id: 1, product_id: 2, quantity: 1, price: 6.0 },

    // Sale 2: Jelo
    { sale_id: 2, product_id: 3, quantity: 2, price: 5.0 },
    { sale_id: 2, product_id: 2, quantity: 1, price: 3.5 },

    // Sale 3: Guest
    { sale_id: 3, product_id: 5, quantity: 2, price: 4.0 },
  ]);
};
