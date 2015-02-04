var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var urlencode = bodyParser.urlencoded({ extended: false });
app.use(express.static('public'));

var cities = {
  'Lotopia': 'Lotopia description',
  'Caspiana': 'Caspiana description',
  'Indigo': 'Indigo description'
};

app.get('/cities', function(req, res) {
  var cityNames = Object.keys(cities);
  res.json(cityNames);
});

app.post('/cities', urlencode, function(req, res) {
  var newCity = req.body;
  cities[newCity.name] = newCity.description;
  res.status(201).json(newCity.name);
});

module.exports = app;
