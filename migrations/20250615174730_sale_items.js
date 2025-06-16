/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("sale_items", (table) => {
    table.increments("id").primary();
    table.integer("sale_id").unsigned().notNullable();
    table
      .foreign("sale_id")
      .references("id")
      .inTable("sales")
      .onDelete("CASCADE");

    table.integer("product_id").unsigned().notNullable();
    table.foreign("product_id").references("id").inTable("products");

    table.integer("quantity").notNullable();
    table.decimal("price", 10, 2).notNullable(); // unit price at time of sale
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sale_items");
};
