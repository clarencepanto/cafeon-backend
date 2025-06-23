export async function up(knex) {
  return knex.schema.createTable("sales", (table) => {
    table.increments("id").primary();
    table.decimal("total", 10, 2).notNullable();
    table.integer("customer_id").unsigned().nullable();
    table
      .foreign("customer_id")
      .references("id")
      .inTable("customers")
      .onDelete("SET NULL"); // Prevent FK constraint error
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("sales");
}
