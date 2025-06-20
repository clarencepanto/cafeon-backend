/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("customers", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("phone").nullable();
    table.string("email").nullable();
    table.timestamps(true, true); // track when customer added
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("customers");
}
