/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("sales", (table) => {
    table.increments("id").primary();
    table.decimal("total", 10, 2).notNullable();
    table.integer("customer_id").unsigned().nullable(); // optional link to customer
    table.foreign("customer_id").references("id").inTable("customers");
    table.timestamps(true, true); // created_at = date of sale
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sales");
};
