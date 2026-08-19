const app=require('./app');const env=require('./config/env');const db=require('./config/db');
const server=app.listen(env.port,()=>console.log(`\n✨ Connectly running at http://localhost:${env.port}\n`));
async function shutdown(){console.log('\nShutting down Connectly...');server.close(async()=>{await db.pool.end();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
