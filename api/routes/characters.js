const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /characters'
    });
});

router.post('/', (req, res, next) => {
    const character = {
        name: req.body.name,
        price: req.body.price
    };
    res.status(201).json({
        message: 'Handling POST requests to /characters',
        createdCharacter: character
    });
});

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