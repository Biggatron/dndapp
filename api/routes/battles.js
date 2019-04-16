const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Battles were fetched'
    });
});

router.post('/', (req, res, next) => {
    const battle = {
        nameame: req.body.name
    };
    res.status(201).json({
        message: 'Battle was created',
        createdBattle: battle
    });
});

router.get('/:battleId', (req, res, next) => {
    res.status(200).json({
        message: 'battle details',
        battleId: req.params.battleId
    });
});

router.delete('/:battleId', (req, res, next) => {
    res.status(200).json({
        message: 'battle deleted',
        battleId: req.params.battleId
    });
});

module.exports = router;