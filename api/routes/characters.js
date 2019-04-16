const express = require('express');
const router = express.Router();
const { query } = require('../../db/db');

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /characters'
    });
});

router.post('/', (req, res, next) => {
    const character = {
        name: req.body.name,
        maxhp: req.body.maxhp
    };
    const results = createCharacter(character.name, character.maxhp, res);
    console.log("hey gey " + results);
});

async function createCharacter(name, maxhp, res) {
    const result = await query(
        `INSERT INTO characters (name, maxhp) VALUES ($1, $2) RETURNING *`,
        [name, maxhp]
    );
    console.log(result.rows[0]);
    res.status(201).json({
        message: 'Handling POST requests to /characters',
        name: result.rows[0].name,
        maxhp: result.maxhp,
        characterId: result.id
    });
    return result;
};

router.get('/:characterId', (req, res, next) => {
    const id = req.params.characterId;
    if (id === 'special') {
        res.status(200).json({
            message: 'You discovered the special ID',
            id: id
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        });
    }
});

router.patch('/:characterId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated character!'
    });
});

router.delete('/:characterId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted character!'
    });
});

module.exports = router;