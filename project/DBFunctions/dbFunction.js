const pgp = require('pg-promise')({
    capSQL: true
});

const cn = {
    host: '172.30.195.209', // server name or IP address;
    port: 5432,
    database: 'gali',
    user: 'gali',
    password: 'gali'
};

const db = pgp(cn);

exports.select = select = (query) => {
    return db.any(query, ['active'])
        .then(data => {
            console.log('DATA->' + data);
            return data;
        })
        .catch(error => {
            console.log('ERROR->' + error);
            return error;
        });
};

exports.selectWithCondition = selectWithCondition = async (fieldToSelect, fieldToCompare, valueTocompare, table) => {
    try {
        const query = `SELECT ${fieldToSelect} FROM ${table} WHERE ${fieldToCompare}=${valueTocompare};`
        console.log(query);
        const data = await db.any(query);
        console.log(data);
        return data;
    } catch (err) {
        console.log(err);
    }

};

exports.insert = insert = async (values, fields, table, isReturn = false) => {
    try {
        let query = pgp.helpers.insert(values, fields, table)
        query = isReturn ? query + 'RETURNING id' : query;
        return await db.any(query);
    } catch (err) {
        console.log(err);
    }
};