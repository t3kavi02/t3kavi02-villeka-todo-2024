import dotenv from 'dotenv';
import pkg from 'pg';

const environment = process.env.NODE_ENV;
dotenv.config();

const { Pool } = pkg;

const openDb = () => {
    const pool = new Pool ({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: environment === "developement" ? process.env.DB_NAME : process.env.TEST_DB_NAME, // process.env.DB_NAME
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    })
    return pool;
};

const pool = openDb();

export { pool }