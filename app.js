var express = require('express');
var bodyParser = require('body-parser');
var client = require('redis').createClient();
var app = express();

var urlencode = bodyParser.urlencoded({ extended: false });
app.use(express.static('public'));

/*client.on('error', function (err) {
  console.log('Error ' + err);
});*/

client.select((process.env.NODE_ENV || 'development').length);

app.get('/cities', function(req, res) {
  client.hkeys('cities', function (error, names) {
    if (error) throw error;

    res.json(names);
  });
});

app.post('/cities', urlencode, function(req, res) {
  var newCity = req.body;
  client.hset('cities', newCity.name, newCity.description, function(error) {
    if (error) throw error;

    res.status(201).json(newCity.name);
  });
});

module.exports = app;
