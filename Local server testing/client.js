var request = require('request');

request('http://localhost:3000', function (error, response, body) {
  console.log('You are: :', body); // Print the HTML for the Google homepage.
});



function send_message(messsage_content) {
    const options = {
    url: 'http://localhost:3000',
    headers: {
      'name': 'my name'
    }
  };

  request('http://localhost:3000', function (error, response, body) {
    console.log('You are: :', body); // Print the HTML for the Google homepage.
  });
}
