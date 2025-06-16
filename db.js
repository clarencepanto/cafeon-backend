// db.js (you can create this for reuse)
// enable access to db
import knex from "knex";
import knexConfig from "./knexfile.js";

const db = knex(knexConfig.development);
export default db;
