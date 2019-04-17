const xss = require('xss');
const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

router.post('/', (req, res, next) => { createBattle(req, res) });
router.get('/', (req, res, next) => { getBattles(req, res) });
router.get('/:battleId', (req, res, next) => { getBattle(req, res) });
router.patch('/:battleId', (req, res, next) => { patchBattle(req, res) });
router.delete('/:battleId', (req, res, next) => { deleteBattle(req, res) });

//----------------------------------------
// Async föll sem sækja og skrifa í 
// gagnagrunninn og senda viðeigandi svör
//----------------------------------------

async function createBattle(req, res) {
    const battle = {
        name: xss(req.body.name)
    };

    const result = await query(
        `INSERT INTO battles (name) VALUES ($1) RETURNING *`,
        [battle.name]
    );
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt create battle'
        });
    };
    const battleId = result.rows[0].battleid;
    var characterIds = [];
    var charAdditionSuccess = true;

    const jsonObject = JSON.parse(JSON.stringify(req.body));
    for (var i=0; i<jsonObject.characters.length; i++) {
        var charResult;
        if (jsonObject.characters[i].characterid) {
            charResult = await query(
                `INSERT INTO battleentries (characterid, battleid) VALUES ($1, $2) RETURNING *`,
                [jsonObject.characters[i].characterid, battleId]
            );
        } else {
            charResult = await query(
                `INSERT INTO characters (name, maxhp) VALUES ($1, $2) RETURNING *`,
                [jsonObject.characters[i].name, jsonObject.characters[i].maxhp]
            );
            charResult = await query(
                `INSERT INTO battleentries (characterid, battleid) VALUES ($1, $2) RETURNING *`,
                [charResult.rows[0].characterid, battleId]
            );
        }
        if (charResult.rows.length === 0) {
            charAdditionSuccess = false;
        } else {
            characterIds.push(charResult.rows[0].characterid);
        };
    };
    res.status(201).json({
        message: 'Battle was created',
        name: result.rows[0].name,
        battleId: result.rows[0].battleid,
        charactersIds: characterIds,
        charAdditionSuccess: charAdditionSuccess
    });
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
    const charResult = await query(
        `SELECT * FROM characters WHERE characterid = ANY (
            SELECT characterid FROM battleentries WHERE battleid = $1
        )`,
        [id]
    )
    if (result.rows.length === 0) {
        res.status(500).json({
            message: 'Couldnt find battle with id ' + id
        });
    } else {
        res.status(200).json({
            message: 'Handling get requests to /battles',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid,
            characters: charResult.rows
        });
    };
};

async function patchBattle(req, res) {
    const battleId = xss(req.params.battleId);
    var addedCharacterIds = [];
    var removedCharacterIds = [];
    var charAdditionSuccess = true;
    var charRemovalSuccess = true;
    var result;
    var charResult;

    const jsonObject = JSON.parse(JSON.stringify(req.body));
    if (jsonObject.name) {
        result = await query(
            `UPDATE battles SET name = $2 WHERE battleid = $1 RETURNING *`,
            [battleId, jsonObject.name]
        );
    }

    // Remove characters from the battle
    for (var i=0; i<jsonObject.removedChars.length; i++) {
        if (jsonObject.removedChars[i].characterid) {
            charResult = await query(
                `DELETE FROM characters WHERE temp = true AND characterid = $1 RETURNING *`,
                [jsonObject.removedChars[i].characterid]
            );
            if (charResult.rows.length === 0) {
                charResult = await query(
                    `DELETE FROM battleentries WHERE characterid = $1 AND battleid = $2 RETURNING *`,
                    [jsonObject.removedChars[i].characterid, battleId]
                );
            };
            if (charResult.rows.length === 0) {
                charRemovalSuccess = false;
            } else {
                removedCharacterIds.push(charResult.rows[0].characterid);
            };
        };  
    };

    // Add a characters to the battle
    for (var i=0; i<jsonObject.addedChars.length; i++) {
        // If we have the character id we try to add an existing character,
        // Otherwise we create a temporary character and add it to the battle
        if (jsonObject.addedChars[i].characterid) {
            // Check whether character is already in battle
            charResult = await query(
                `SELECT * FROM battleentries WHERE characterid = $1 AND battleid = $2`,
                [jsonObject.addedChars[i].characterid, battleId]
            );
            // If not it's added to the battle
            if (!charResult.rows[0]) {
                charResult = await query(
                    `INSERT INTO battleentries (characterid, battleid) VALUES ($1, $2) RETURNING *`,
                    [jsonObject.addedChars[i].characterid, battleId]
                );
            }
        } else {
            // Create the temporary character
            charResult = await query(
                `INSERT INTO characters (name, maxhp) VALUES ($1, $2) RETURNING *`,
                [jsonObject.addedChars[i].name, jsonObject.addedChars[i].maxhp]
            );
            // Add temporary character to battle
            charResult = await query(
                `INSERT INTO battleentries (characterid, battleid) VALUES ($1, $2) RETURNING *`,
                [charResult.rows[0].characterid, battleId]
            );
        }
        // If charResult has no rows then something went wrong with adding the character,
        // likely wrong input data.
        if (charResult.rows.length === 0) {
            charAdditionSuccess = false;
        } else {
            addedCharacterIds.push(charResult.rows[0].characterid);
        };
    };

    res.status(200).json({
        message: 'Battle was edited',
        name: result.rows[0].name,
        battleId: result.rows[0].battleid,
        addedCharactersIds: addedCharacterIds,
        removedCharactersIds: removedCharacterIds,
        charAdditionSuccess: charAdditionSuccess,
        charRemovalSuccess: charRemovalSuccess
    });
};

async function deleteBattle(req, res) {
    const id = xss(req.params.battleId);

    const charDeleteResult = await query(
        `DELETE FROM characters WHERE temp = true AND characterid = ANY (
            SELECT characterid FROM battleentries WHERE battleid = $1
        )`,
        [id]
    );

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
            message: 'Battle was deleted',
            name: result.rows[0].name,
            battleId: result.rows[0].battleid,
            charactersDeleted: charDeleteResult.rows
        });
    };
};

module.exports = router;