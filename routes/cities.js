var express = require('express');
var bodyParser = require('body-parser');
var client = require('redis').createClient();

var urlencode = bodyParser.urlencoded({ extended: false });
var router = express.Router();

/*client.on('error', function (err) {
  console.log('Error ' + err);
});*/

client.select((process.env.NODE_ENV || 'development').length);

router.route('/')
  .get(function(req, res) {
    client.hkeys('cities', function (error, names) {
      if (error) throw error;

      res.json(names);
    });
  })
  .post(urlencode, function(req, res) {
    var newCity = req.body;

    if (!newCity.name || !newCity.description) {
      res.sendStatus(400);
    }
    else {
      client.hset('cities', newCity.name, newCity.description, function(error) {
        if (error) throw error;

        res.status(201).json(newCity.name);
      });
    }
  });

router.route('/:name')
  .get(urlencode, function(req, res) {
    client.hget('cities', req.params.name, function(error, desc) {
      if (error) throw error;

      res.render('show.ejs',
        {
          city: { name: req.params.name, description: desc }
        });
    });
  })
  .delete(urlencode, function(req, res) {
    client.hdel('cities', req.params.name, function(error) {
      if (error) throw error;

      res.sendStatus(204);
    });
  });

module.exports = router;
