import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_orHLXMI4fv0i@ep-nameless-shadow-ax7twe87-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require');
sql`select 1 as x`.then(r => {
  console.log('connected:', r); 
  process.exit(0);
}).catch(e => {
  console.error('error:', e); 
  process.exit(1);
});
