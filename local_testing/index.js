const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  shell = require('shelljs'),
  clear = require("clear");


const hostname = 'localhost';
const port = 3000;

const roles = ["werewolf", "drunk"]

const num_players_to_roles = {
  3: ["werewolf", "seer", "robber", "troublemaker", "drunk"],
  4: ["werewolf", "seer", "robber", "troublemaker", "drunk", "villager"],
  5: ["werewolf", "seer", "robber", "troublemaker", "drunk", "villager", "villager"]
}
let port_dict = {};


const questions_for_roles = {
  "werewolf": {
    "actions": [
      {
        "name": "you_a_werewolf",
        "type": "confirm",
        "question": "You don't have to perform any actions."
      }
    ]
  },
  "seer": {
    "actions": [
      {
        "name": "seer_pile_choice",
        "type": "list",
        "question": "Would you like to see two cards from the pile or the card of 1 other player?",
        "choices": [
          "player_card1",
          "player_card2",
          "2_from_pile"
        ]
      }
    ]
  },
  "robber": {
    "actions": [
      {
        "name": "robber_steal_choice",
        "type": "list",
        "question": "What player would you like to switch with?",
        "choices": [
          "player_card1",
          "player_card2",
          "player_card3"
        ]
      }
    ]
  },
  "troublemaker": {
    "actions": [
      {
        "name": "troublemaker_person_1",
        "type": "list",
        "question": "Who is the first person you want to switch?",
        "choices": [
          "player_card1",
          "player_card2",
          "player_card3"
        ]
      },
      {
        "name": "troublemaker_person_2",
        "type": "list",
        "question": "Who is the second person you want to switch?",
        "choices": [
          "player_card1",
          "player_card2",
          "player_card3"
        ]
      }
    ]
  },
  "drunk": {
    "actions": [
      {
        "name": "drunk_swap",
        "type": "list",
        "question": "Which card would you like to swap with?",
        "choices": [
          "card1",
          "card2",
          "card3"
        ]
      }
    ]
  },
  "villager": {
    "actions": [
      {
        "name": "you_a_villager",
        "type": "confirm",
        "question": "You don't have to perform any actions."
      }
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

function determine_winner() {
  //TODO: count votes here
  var killed = 'placeholder';
  var killed_party = 'placeholder';
  //TODO: determine role here
  if (killed_party == 'werewolf') {
    message_all_players(killed + " was killed. " + killed + " was a werewolf, so
    villagers win!");
  }
  else {
    message_all_players(killed + " was killed. " + killed + " was not a werewolf, so
    werewolves win!");
  }
}

function game_start() {
  clear();
  clear_player_screens();
  message_all_players("Welcome to one night ultimate werewolf.")
  send_roles();
  question_all_players();
  // Give players 5 seconds for actions
  // TODO: figure out better text
  setTimeout(message_all_players, 5 * 1000, "You have 5 minutes to discover the werewolf ... Discuss!");
  setTimeout(message_all_players, 4 * 60 * 1000, "One minute left!");
  setTimeout(message_all_players, 5 * 60 * 1000, "Time's up! Vote on who you think is the werewolf, no more discussing!
  You have one minute to vote before the game ends.");
  setTimeout(determine_winner, 60 * 1000);
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
