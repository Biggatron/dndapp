const xss = require('xss');
const express = require('express');
const router = express.Router();
const { query } = require('../../db/db');

router.post('/', (req, res, next) => { createCharacter(req, res) });
router.get('/', (req, res, next) => { getCharacters(req, res) });
router.get('/:characterId', (req, res, next) => { getCharacter(req, res) });
router.patch('/:characterId', (req, res, next) => { patchCharacter(req, res) });
router.delete('/:characterId', (req, res, next) => { deleteCharacter(req, res) });

//----------------------------------------
// Async föll sem sækja og skrifa í 
// gagnagrunninn og senda viðeigandi svör
//----------------------------------------

async function createCharacter(req, res) {
    const character = {
        name: xss(req.body.name),
        maxhp: xss(req.body.maxhp)
    };
    const result = await query(
        `INSERT INTO characters (name, maxhp) VALUES ($1, $2) RETURNING *`,
        [character.name, character.maxhp]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt create character'
        });
    } else {
        res.status(201).json({
            message: 'Character was created',
            name: result.rows[0].name,
            maxhp: result.rows[0].maxhp,
            characterId: result.rows[0].characterid
        });
    };
};

async function getCharacters(req, res) {
    const result = await query(
        `SELECT * FROM characters`
    );
    res.status(200).json({
        message: 'Handling get requests to /characters',
        characters: result.rows
    });
};

async function getCharacter(req, res) {
    const id = xss(req.params.characterId);
    const result = await query(
        `SELECT * FROM characters WHERE characterid = $1`,
        [id]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find character with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Handling get requests to /characters',
            name: result.rows[0].name,
            maxhp: result.rows[0].maxhp,
            characterId: result.rows[0].characterid
        });
    };
};

async function patchCharacter(req, res) {
    const id = xss(req.params.characterId);
    const character = {
        name: xss(req.body.name),
        maxhp: xss(req.body.maxhp)
    };

    const updates = [
        character.name ? 'name' : null,
        character.maxhp ? 'maxhp' : null
      ]
        .filter(Boolean)
        .map((field, i) => `${field} = $${i + 2}`);
    console.log("updates: " + updates);

    const values = [
        id, 
        character.name ? character.name : null,
        character.maxhp ? character.maxhp : null
      ].filter(Boolean);

    const result = await query(
        `UPDATE characters SET ${updates} WHERE characterid = $1 RETURNING *`,
        values
    )
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find character with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Handling patch request to /characters',
            name: result.rows[0].name,
            maxhp: result.rows[0].maxhp,
            characterId: result.rows[0].characterid
        });
    };
};

async function deleteCharacter(req, res) {
    const id = xss(req.params.characterId);
    const result = await query(
        `DELETE FROM characters WHERE characterid = $1 RETURNING *`,
        [id]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find character with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Character var eytt',
            name: result.rows[0].name,
            maxhp: result.rows[0].maxhp,
            characterId: result.rows[0].characterid
        });
    };
};

module.exports = router;