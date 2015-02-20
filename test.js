var request = require('supertest');
var app = require('./app');

var client = require('mongodb').MongoClient;
var dbConnection = 'mongodb://127.0.0.1:27017/test';

describe('Requests to the root path', function() {

  it('Returns a 200 status code', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('Returns an HTML format', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/, done);
  });

  it('Returns an index file with cities', function(done) {
    request(app)
      .get('/')
      .expect(/cities/i, done);
  });

});

describe('Listing cities on /cities', function() {

  before(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({}, function(err, result) {
        if(err) throw err;

        collection.insert(
          [{ name: 'Lotopia', description: 'Lotopia desc' },
           { name: 'Caspiana', description: 'Caspiana desc' },
           { name: 'Indigo', description: 'Indigo desc' }],
          function(err, objects) { if(err) throw err; });
      });
    });
  });

  after(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({}, function(err, result) {
        if(err) throw err;
      });
    });
  });

  it('Returns 200 status code', function(done) {
    request(app)
      .get('/cities')
      .expect(200, done);
  });

  it('Returns JSON format', function(done) {
    request(app)
      .get('/cities')
      .expect('Content-Type', /json/, done);
  });

  it('Returns initial cities', function(done) {
    request(app)
      .get('/cities')
      .expect(JSON.stringify([{name:'Lotopia'}, {name:'Caspiana'}, {name:'Indigo'}]), done);
  });

});

describe('Creating new cities', function() {

  after(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({}, function(err, result) {
        if(err) throw err;
      });
    });
  });

  it('Returns a 201 status code', function(done) {
    request(app)
      .post('/cities')
      .send('name=Springfield&description=where+the+simpsons+live')
      .expect(201, done);
  });

  it('Return the city name', function(done) {
    request(app)
      .post('/cities')
      .send('name=Springfield&description=where+the+simpsons+live')
      .expect(/springfield/i, done);
  });

  it('Validates city name and description', function(done) {
    request(app)
      .post('/cities')
      .send('name=&description=')
      .expect(400, done);
  });

});

describe('Deleting cities', function() {

  before(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.insert(
        { name: 'Bananas', description: 'a tasty fruit' },
        function(err, objects) { if(err) throw err; });
    });
  });

  after(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({}, function(err, result) {
        if(err) throw err;
      });
    });
  });

  it('Returns a 204 status code', function(done) {
    request(app)
      .delete('/cities/Bananas')
      .expect(204, done);
  });

});

describe('Shows city info', function() {

  before(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.insert(
        { name: 'Bananas', description: 'a tasty fruit' },
        function(err, objects) { if(err) throw err; });
    });
  });

  after(function() {
    client.connect(dbConnection, function(err, db) {
      if(err) throw err;

      var collection = db.collection('cities');

      collection.remove({}, function(err, result) {
        if(err) throw err;
      });
    });
  });

  it('Returns 200 status code', function(done) {
    request(app)
      .get('/cities/Bananas')
      .expect(200, done);
  });

  it('Returns HTML format', function(done) {
    request(app)
      .get('/cities/Bananas')
      .expect('Content-Type', /html/, done);
  });

  it('Returns information for given city', function(done) {
    request(app)
      .get('/cities/Bananas')
      .expect(/tasty/, done);
  });

});
