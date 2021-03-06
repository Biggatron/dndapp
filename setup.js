const { query } = require('./db/db');

const fs = require('fs');
const util = require('util');

const connectionString = "postgres://postgres:postgres@localhost:5432/maindb";

const readFileAsync = util.promisify(fs.readFile);

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflum ef til
  await query('DROP TABLE IF EXISTS characters CASCADE');
  await query('DROP TABLE IF EXISTS battles CASCADE');
  await query('DROP TABLE IF EXISTS battleentries CASCADE');
  await query('DROP TABLE IF EXISTS users CASCADE');
  console.info('Töflum eytt');

  // búa til töflur
  try {
    const createTable = await readFileAsync('./db/schema.sql');
    await query(createTable.toString('utf8'));
    console.info('Töflur búnar til');
  } catch (e) {
    console.error('Villa við að búa til töflur:', e.message);
    return;
  }
  
  try {
    const insert = await readFileAsync('./db/insert.sql');
    await query(insert.toString('utf8'));
    console.info('Gögnum bætt við');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }

}


main().catch((err) => {
    console.error(err);
  });