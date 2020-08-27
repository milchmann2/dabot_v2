import * as express from 'express';
import * as path from 'path';
import * as open from 'open';


const app = express.default();
const port = process.env.PORT || 3000;


app.get('/', function (req, res) {
  // __dirname --> current folder we are in
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running in http://localhost: ${port}`)
  open.default('http://localhost:' + port);
});

// npm install localtunnel -g
// start webserver
// lt --port 3000 --subdomain yoursubdomain
