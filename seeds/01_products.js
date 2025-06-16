/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function (knex) {
  await knex("products").del();

  await knex("products").insert([
    { id: 1, name: "Espresso", price: 3.0, quantity: 50 },
    { id: 2, name: "Latte", price: 4.5, quantity: 35 },
    { id: 3, name: "Matcha Latte", price: 5.0, quantity: 25 },
    { id: 4, name: "Cappuccino", price: 4.0, quantity: 40 },
    { id: 5, name: "Cold Brew", price: 4.75, quantity: 30 },
  ]);
};
