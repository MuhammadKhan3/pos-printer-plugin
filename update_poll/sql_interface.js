const path=require('path')
const sqlite=require('sqlite3').verbose();
const sqlFile=path.join(__dirname,'db.sql')
const fs=require('fs')

function sql_run(){
   
    try {
        const db = new sqlite.Database(path.join(__dirname,'..','offline_server', 'db', 'ApiData.db'));
        
        fs.readFile(sqlFile, 'utf8', async(err, data) => {
            if (err) {
            console.error("Error reading the file:", err);
            return;
            }
            const queries = data.split(';').map(query => query.trim()).filter(query => query.length > 0);
            console.log(queries);
            await executeQueries(db,queries)

        });

    } catch (error) {
        console.log("------errors:",error);
                    
    }

}



function runQuery(db, query) {
    return new Promise((resolve, reject) => {
        db.run(query, function (err) {
            if (err) {
                console.error("Error Run Query:", err.message);
                reject(err); // Reject the promise on error
            } else {
                console.log("----------------Query Run Successfully----------------");
                resolve(); // Resolve the promise on success
            }
        });
    });
}

function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error("Error closing the database:", err.message);
                reject(err); // Reject the promise on error
            } else {
                console.log("----------------Database connection closed----------------");
                resolve(); // Resolve the promise on success
            }
        });
    });
}

function executeQueries(db, queries) {
    console.log(db,queries)
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                for (const query of queries) {
                    await runQuery(db, query); // Run each query sequentially
                }
                await closeDatabase(db)
                resolve(); // Resolve when all queries and closing are done
            } catch (error) {
                reject(error); // Reject if there's any error
            }
        });
    });
}

// Example usage:

module.exports={sql_run};