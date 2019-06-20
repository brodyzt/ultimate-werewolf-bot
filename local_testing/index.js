const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  shell = require('shelljs'),
  clear = require("clear");


const hostname = 'localhost';
const port = 3000;

// const roles = ["werewolf", "seer", "drunk"];
const roles = ["werewolf", "drunk"];
let port_dict = {};


const questions_for_roles = {
  "werewolf": {
    "type": "confirm",
    "question": "You don't have to perform any actions"
  },
  "drunk": {
    "type": "list",
    "question": "Which card would you like to swap with",
    "choices": [
      "card1",
      "card2",
      "card3"
    ]
  }
}

let responses = {};

app.post('/client_message', (req, res) => {
  // console.log(req);
  res.status(200)
});

function message_player(role, message) {
  const options = {
    url: 'http://localhost:' + port_dict[role] + '/print',
    json: true,
    method: "POST",
    body: {
      "message": message
    }
  };

  request.post(options);
}

function message_all_players(message) {
  roles.forEach(role => {
    message_player(role, message);
  })
}

function question_player(role, body) {
  const options = {
    url: 'http://localhost:' + port_dict[role] + '/question',
    json: true,
    method: "POST",
    body: body
  };

  request.post(options);
}

function question_all_players() {
  roles.forEach(role => {
    question_player(role, questions_for_roles[role]);
  })
}


function clear_player_screens() {
  roles.forEach(role => {
    request.post('http://localhost:' + port_dict[role] + '/clear');
  })
}

function send_roles() {
  roles.forEach(role => {
    message_player(role, "You are the " + role);
  })
}

function game_start() {
  clear_player_screens();
  message_all_players("Welcome to one night ultimate werewolf.")
  send_roles();
  question_all_players();
  // Give players 5 seconds for actions
  // TODO: figure out better text
  setTimeout(message_all_players, 5 * 1000, "You have 5 minutes to discover the werewolf ... Discuss!");
  setTimeout(message_all_players, 4 * 60 * 1000, "One minute left!");
  setTimeout(message_all_players, 5 * 60 * 1000, "Time up! Vote on who you think is the werewolf, no more discussing!");
}

app.post('/receive_action', (req, res) => {
  const action = req.body.action;
  const actor = req.body.actor;
  console.log(actor + " chose " + action);
})

async function main() {

  roles.forEach((role, index) => {
    const port = "800" + index;
    port_dict[role] = port;
    const pwd = require('path').dirname(require.main.filename);

    console.log(pwd);
    shell.exec('osascript -e \'tell application "Terminal" to do script "cd ' + pwd + ' && bash client.sh ' + role + ' ' + port + '"\'')
  });

  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  setTimeout(game_start, 3000);
}

main()
