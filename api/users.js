const xss = require('xss');
const express = require('express');
const router = express.Router();
const { query } = require('../db/db');
const crypto = require('crypto');

router.post('/signup', (req, res, next) => { createUser(req, res) });
router.post('/login', (req, res, next) => { loginUser(req, res) });
router.get('/current', (req, res, next) => { getCurrentUser(req, res) });
router.patch('/edit', (req, res, next) => { authenticateUser(req, res, editUser) });

async function authenticateUser(req, res, func) {
    console.log("authenticting user");

    const user = {
        id: xss(req.header('id'))
    };
    
    // Athuga hvort user sé til
    const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
    );
    if (result.rows.length === 0) {
        res.status(401).json({
            message: 'You must login to continue'
        });
    } else {
        func(req, res);
    };
};

async function editUser(req, res) {
    const user = {
        email: xss(req.body.email),
        password: xss(req.body.password),
        name: xss(req.body.username),
        salt: null,
        hash: null
    };

    // Athuga hvort user sé til
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [user.email]
    );

    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find user'
        });
    } else {
        if (user.password !== null) {
            user.salt = crypto.randomBytes(16).toString('hex');
            user.hash = crypto.pbkdf2Sync(user.password, user.salt, 10000, 64, 'sha512').toString('hex')
        };

        const updates = [
            user.name ? 'username' : null,
            user.salt ? 'salt' : null,
            user.hash ? 'hash' : null
        ]
            .filter(Boolean)
            .map((field, i) => `${field} = $${i + 2}`);
        console.log("updates: " + updates);

        const values = [
            user.email,
            user.name ? user.name : null,
            user.salt ? user.salt : null,
            user.hash ? user.hash : null,
        ].filter(Boolean);

        const result = await query(
            `UPDATE users SET ${updates} WHERE email = $1 RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            res.status(500).json({
                message: 'Couldnt update user'
            });
        } else {
            res.status(201).json({
                message: 'User was updated',
                email: result.rows[0].email,
                username: result.rows[0].username
            });
        };
    };
};

async function createUser(req, res) {
    const user = {
        email: xss(req.body.email),
        password: xss(req.body.password),
        name: xss(req.body.username)
    };
    var salt = crypto.randomBytes(16).toString('hex');
    var hash = crypto.pbkdf2Sync(user.password, salt, 10000, 64, 'sha512').toString('hex');
    
    // Athuga hvort user sé til
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [user.email]
    );
    if (result.rows.length === 0) {
        const result = await query(
            'INSERT INTO users (email, hash, salt, username) VALUES ($1, $2, $3, $4) RETURNING *',
            [user.email, hash, salt, user.name]
        );
        if (result.rows.length === 0) {
            res.status(500).json({
                message: 'Couldnt create user'
            });
        } else {
            res.status(201).json({
                message: 'User was created',
                email: result.rows[0].email,
                username: result.rows[0].username
            });
        }
    } else {
        res.status(201).json({
            message: 'Email has already been used',
        });
    };
    
};

async function loginUser(req, res) {
    const user = {
        email: xss(req.body.email),
        password: xss(req.body.password)
    };

    // Sækja user
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [user.email]
    );

    if (result.rows.length === 0) {
        res.status(201).json({
            message: 'Incorrect email or password',
            name: result.rows[0].email
        });
    } else {
        // Reikna út hash og bera saman við hash í gagnagrunni
        var salt = result.rows[0].salt;
        var hash = crypto.pbkdf2Sync(user.password, salt, 10000, 64, 'sha512').toString('hex');
        
        if (result.rows[0].hash !== hash) {
            res.status(201).json({
                message: 'Incorrect email or password',
                name: result.rows[0].email
            });
        } else {
            // Búa til user id til að nota í cookie
            userid = crypto.randomBytes(16).toString('hex');
            const result = await query(
                'UPDATE users SET id = $1 WHERE email = $2 RETURNING *',
                [userid, user.email]
            );
            res.status(201).json({
                message: 'Login successfull',
                userid: result.rows[0].id
            });
        };
    };
};

async function getCurrentUser(req, res) {
    const user = {
        id: xss(req.header('id'))
    };
    
    // Athuga hvort user sé til
    const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
    );
    if (result.rows.length === 0) {
        res.status(401).json({
            message: 'You must login to continue'
        });
    } else {
        res.status(201).json({
            message: 'User is logged in',
            userid: result.rows[0].id,
            email: result.rows[0].email,
            username: result.rows[0].username
        });
    };
};

module.exports = router;