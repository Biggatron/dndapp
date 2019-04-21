const bcrypt = require('bcrypt');
const xss = require('xss');
const router = express.Router();
const { query } = require('../db/db');
const saltRounds = 10;

router.post('/create', (req, res, next) => { createUser(req, res) });

//----------------------------------------
// Async föll sem sækja og skrifa í 
// gagnagrunninn og senda viðeigandi svör
//----------------------------------------

async function createUser(req, res) {
    bcrypt.hash(xss(req.body.passwordsignup), saltRounds, function (err, hash) {
        const user = {
            name: xss(req.body.name),
            password: hash
        }
        const result = await query(
            `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
            [user.name, user.password]
        );
        if (result.rows.length === 0) {
            res.status(500).json({
                message: 'Couldnt create user'
            });
        } else {
            res.status(201).json({
                message: 'user was created',
                name: result.rows[0].name,
            });
        };
        



        db.User.create({
          name: req.body.usernamesignup,
          email: req.body.emailsignup,
          password: hash
          }).then(function(data) {
           if (data) {
           res.redirect('/home');
           }
         });
        });
};