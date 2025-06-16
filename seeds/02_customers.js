/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("customers").del();

  await knex("customers").insert([
    {
      id: 1,
      name: "Clarence",
      phone: "123-456-7890",
      email: "clarence@coffee.com",
    },
    { id: 2, name: "Jelo", phone: "321-654-0987", email: "jelo@beans.com" },
    { id: 3, name: "Manny", phone: "999-888-7777", email: "manny@barista.com" },
  ]);
};
