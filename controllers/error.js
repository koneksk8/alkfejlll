
// controllers/error.js
var express = require('express');
var router = express.Router();

var decorateErrors = require('../viewmodels/error');

// Hibalista oldal
router.get('/list', function (req, res) {
    req.app.models.error.find().then(function (errors) {
        res.render('errors/list', {
            errors: decorateErrors(errors),
            messages: req.flash('info')
        });
    });
});

// Hiba felvitele
router.get('/new', function(req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('errors/new', {
        validationErrors: validationErrors,
        data: data,
    });
})

//bejegyzes szerkesztese

router.get('/edit/:id', function (req, res) {
    var id = req.param('id');
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    req.app.models.error.findOne({id: id}).then(function (error) {
        res.render('errors/edit', {
            data: error
        });
    });
});

router.post('/edit/:id', function (req, res) {
    var Id = req.param('id');
    // adatok ellenőrzése
    req.checkBody('location', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('description', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    console.log(req.body);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/errors/edit/' + Id);
    }
    else {
        // adatok updatelése és a hibalista megjelenítése
        req.app.models.error.update({id: Id}, {
                date: new Date().toLocaleString(),//date: req.body.date,
                location: req.body.location,
                description: req.body.description
        })
        .then(function (error) {
            //siker
            req.flash('info', 'Aru sikeresen szerkesztve!');
            res.redirect('/errors/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err);
        });
    }
});


// bejegyzes torlese
router.get('/delete/:id', function (req, res) {
    var fId = req.param('id');
    req.app.models.error.destroy({ id: fId })
    .then(function (error) {
        req.flash('info', 'Áru sikeresen törölve!');
        res.redirect('/errors/list');
    })
})

// Hiba felvitele POST
router.post('/new', function(req, res) {
   // adatok ellenőrzése
    req.checkBody('helyszin', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/errors/new');
    }
    else {
        req.app.models.error.create({
            status: 'new',
            location: req.body.helyszin,
            description: req.body.leiras
        })
        .then(function (error) {
            //siker
            req.flash('info', 'Hiba sikeresen felvéve!');
            res.redirect('/errors/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err)
        });
    }
})

module.exports = router;

