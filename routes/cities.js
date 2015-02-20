var express = require('express');
var bodyParser = require('body-parser');
var client = require('mongodb').MongoClient;

var urlencode = bodyParser.urlencoded({ extended: false });
var router = express.Router();
var dbConnection = 'mongodb://127.0.0.1:27017/' + (process.env.NODE_ENV || 'development');

router.route('/')
  .get(function(req, res) {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.find({}, {'name': true, '_id': false}).toArray(function(err, names) {
        if (err) throw err;

        res.json(names);
      });
    });
  })
  .post(urlencode, function(req, res) {
    var newCity = req.body;

    if (!newCity.name || !newCity.description) {
      res.sendStatus(400);
    }
    else {
      client.connect(dbConnection, function(err, db) {
        if(err) throw err;

        var collection = db.collection('cities');

        collection.insert({ name: newCity.name, description: newCity.description }, function(err, objects) {
          if(err) throw err;

          res.status(201).json(newCity);
        });
      });
    }
  });

router.route('/:name')
  .get(urlencode, function(req, res) {
    client.connect(
      dbConnection,
      function(err, db) {
        if(err) throw err;

        var collection = db.collection('cities');

        collection.findOne(
          { name: req.params.name },
          { 'description': true, '_id': false },
          function(err, desc) {
            if (err) throw err;

            res.render('show.ejs',
              {
                city: { name: req.params.name, description: desc.description }
              });
          });
      });
  })
  .delete(urlencode, function(req, res) {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({ name: req.params.name }, function(err, objects) {
        if(err) throw err;

        res.sendStatus(204);
      });
    });
  });

module.exports = router;
