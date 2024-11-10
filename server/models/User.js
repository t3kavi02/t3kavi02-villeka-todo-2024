import {pool} from '../db.js';

const insertUser = async (email, hashedpassword) => {
    return await pool.query('INSERT INTO account (email, password) VALUES ($1, $2)', [email, hashedpassword]);
}

const selectUserByEmail = async (email) => {
    return await pool.query('SELECT * FROM account WHERE email = $1', [email]);
}

export { insertUser, selectUserByEmail };
