/**
 * * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("customers", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("phone").notNullable();
    table.string("frequent_order").notNullable(); // main focus
    table.integer("visits").defaultTo(0);
    table.timestamps(true, true); // created_at, updated_at
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("customers");
}
