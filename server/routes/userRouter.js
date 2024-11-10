import { pool } from "../helpers/db.js";
import { Router } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const { sign } = jwt;

const router = Router();




router.post("/register", async (req, res, next) => {
    
    //debuging extra line
    console.log("Register attempt:", req.body.email,{
        email: req.body.email,
        password: req.body?.password?.length
    }); // Log the email
 
    // Add password length validation
    if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    hash(req.body.password, 10, (error, hashedPassword) => {
        if (error) {
            return next(error);
        }
        try {
            pool.query(
                "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING *",
                [req.body.email, hashedPassword],
                (error, result) => {
                    if (error) {
                        //extra line for debugging
                        console.error("Database error during registration:", error);
                        return next(error);
                    }
                    res.status(201).json({ 
                        id: result.rows[0].id, 
                        email: result.rows[0].email 
                    });

                }
            );
        } catch (error) {
            //extra line for debugging
            console.error("Unexpected error during registration:", error);
            return next(error);
        }
    });
});


router.post("/login", (req, res, next) => {
    const invalid_message = "Invalid Credentials";

    try {
        pool.query(
            "SELECT * FROM account WHERE email = $1",
            [req.body.email],
            (error, result) => {
                if (error) {
                    return next(error);
                }
                if (result.rowCount === 0) return next(new Error(invalid_message));

                const user = result.rows[0]; // Assign the user data from the query result

                compare(req.body.password, user.password, (error, match) => {
                    if (error) {
                        return next(error);
                    }
                    if (!match) return next(new Error(invalid_message));

                    const token = sign({ user: req.body.email }, process.env.JWT_SECRET_KEY, {
                        expiresIn: "1h"
                    });
                    res.status(200).json(
                        { 
                            'id': user.id,
                            'email': user.email,
                            'token': token
                        }
                    );
                });
            }
        );
    } catch (error) {
        return next(error);
    }
});


export default router;