const xss = require('xss');
const express = require('express');
const router = express.Router();
const { query } = require('../../db/db');

router.post('/', (req, res, next) => { createBattle(req, res) });
router.get('/', (req, res, next) => { getBattles(req, res) });
router.get('/:battleId', (req, res, next) => { getBattle(req, res) });
router.delete('/:battleId', (req, res, next) => { deleteBattle(req, res) });
//----------------------------------------
// Async föll sem sækja og skrifa í 
// gagnagrunninn og senda viðeigandi svör
//----------------------------------------

async function createBattle(req, res) {
    const battle = {
        name: xss(req.body.name),
        characters : xss(req.body.characters)
    };

    const result = await query(
        `INSERT INTO battles (name) VALUES ($1) RETURNING *`,
        [battle.name]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt create battle'
        });
    } else {
        res.status(201).json({
            message: 'Battle was created',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid
        });
    };

    
};

async function getBattles(req, res) {
    const result = await query(
        `SELECT * FROM battles`
    );
    res.status(200).json({
        message: 'Handling get requests to /battles',
        battles: result.rows
    });
};

async function getBattle(req, res) {
    const id = xss(req.params.battleId);
    const result = await query(
        `SELECT * FROM battles WHERE battleid = $1`,
        [id]
    );
    console.log("resultsss: " + result);
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find battle with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Handling get requests to /battles',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid
        });
    };
};

async function patchbattle(req, res) {
    const id = xss(req.params.battleId);
    const battle = {
        name: xss(req.body.name)
    };

    const updates = [
        battle.name ? 'name' : null
      ]
        .filter(Boolean)
        .map((field, i) => `${field} = $${i + 2}`);

    const values = [
        id, 
        battle.name ? battle.name : null
      ].filter(Boolean);

    const result = await query(
        `UPDATE battles SET ${updates} WHERE battleid = $1 RETURNING *`,
        values
    )
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find battle with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Handling patch request to /battles',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid
        });
    };
};

async function deleteBattle(req, res) {
    const id = xss(req.params.battleId);
    const result = await query(
        `DELETE FROM battles WHERE battleid = $1 RETURNING *`,
        [id]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find battle with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Bardaga var eytt ',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid
        });
    };
};

module.exports = router;