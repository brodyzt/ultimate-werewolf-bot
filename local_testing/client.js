const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  clear = require("clear"),
  inquirer = require('inquirer');


const name = process.argv[2];
const port = process.argv[3]

// request('http://localhost:3000', function (error, response, body) {
//   console.log('You are: :', body); // Print the HTML for the Google homepage.
// });

app.listen(port, () => console.log('webhook is listening'));



function send_message(messsage_content) {
  // global name;

    console.log("Your name is " + name + "\n\n\n");

    const options = {
    url: 'http://localhost:3000/client_message',
    json: true,
    method: "POST",
    body: {
      "name": name
    },
    headers: {
      'name': 'my name'
    }
  };

  request.post(options);
}

function take_action(body) {
    const options = {
    url: 'http://localhost:3000/receive_action',
    json: true,
    method: "POST",
    body: body
  };

  request.post(options);
}

app.post('/clear', (req, res) => {
  clear()

  res.status(200);
});

// app.get('/name', (req, res) => {
//   main();
//
//   res.status(200).send(name)
// });

app.post('/print', (req, res) => {
  console.log(req.body.message);

  res.sendStatus(200);
});

app.post('/question', (req, res) => {
  display_question(req.body);

  res.sendStatus(200);
});

async function display_question(body) {
  console.log(body);
  console.log(body.question);
  console.log(body.type);

  const questions = [{
    type: body.type,
    choices: body.choices,
    name: 'action',
    message: body.question,
  }];

  let answers = await inquirer.prompt(questions);
  answers["actor"] = name;
  clear();
  take_action(answers);

}
