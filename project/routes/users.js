const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../DBFunctions/dbFunction');

const clients = [];

eventsHandler = (request, response, next) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify(facts)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    name: request.body.userName,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

router.post('/login', async (req, res, next) => {
  const colunms = (await db.getColumns("users")).map(colunm => colunm.column_name).toString();
  const user = await db.selectWithCondition(colunms, 'user_name', "'" + req.body.userName + "'", "users");

  if (!user) {
    console.log("user not found");
    res.sendStatus(404);
  } else if (user[0].password !== req.body.password) {
    console.log("password incorrect");
    res.sendStatus(403);
  } else {
    const token = jwt.sign({ userName: user.user_name, admin: user.is_admin }, 'loginUser');
    delete user[0].password;
    eventsHandler(req, res, next);
    console.log("login succeeded " + token);
    res.send({ token, user: user[0] });
  }
});

router.post('/login/policeStation', async (req, res, next) => {
  const colunms = (await db.getColumns("users")).map(colunm => colunm.column_name).toString();
  const user = await db.selectWithCondition(colunms, 'user_name', "'" + req.body.userName + "'", "users");

  if (!user) {
    console.log("user not found");
    res.sendStatus(404);
  } else if (user[0].password !== req.body.password || !user[0].is_admin) {
    console.log("password incorrect");
    res.sendStatus(403);
  } else {
    const token = jwt.sign({ userName: user.user_name, admin: user.is_admin }, 'loginUser');
    delete user[0].password;
    console.log("login succeeded " + token);
    res.send({ token, user: user[0] });
  }
});


router.get('/', async (req, res, next) => {
  const query = 'SELECT user_name, photo FROM users;'
  const users = await db.select(query);
  res.send(users);
});

module.exports = { router, clients };
