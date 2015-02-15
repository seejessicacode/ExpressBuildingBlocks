var request = require('supertest');
var app = require('./app');

var client = require('redis').createClient();
client.select('test'.length);

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
    client.flushdb();

    client.hset('cities', 'Lotopia', 'Lotopia desc');
    client.hset('cities', 'Caspiana', 'Caspiana desc');
    client.hset('cities', 'Indigo', 'Indigo desc');
  });

  after(function() {
    client.flushdb();
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
      .expect(JSON.stringify(['Lotopia', 'Caspiana', 'Indigo']), done);
  });

});

describe('Creating new cities', function() {

  after(function() {
    client.flushdb();
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
    client.hset('cities', 'Bananas', 'a tasty fruit');
  });

  after(function() {
    client.flushdb();
  });

  it('Returns a 204 status code', function(done) {
    request(app)
      .delete('/cities/Bananas')
      .expect(204, done);
  });

});

describe('Shows city info', function() {

  before(function() {
    client.hset('cities', 'Bananas', 'a tasty fruit');
  });

  after(function() {
    client.flushdb();
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
