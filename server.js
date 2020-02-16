const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const socket = require('socket.io');

app.use(cors({
  "origin": 'http://localhost:3000', //origin sets domains that we approve
  "methods": "GET,POST,DELETE,PUT",
}));

app.use(express.static(path.join(__dirname, '/client/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'not found ...'});
});


app.use((req, res) => {
  res.status(404).send('404 not found...');
})

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});

let messages = [];

const io = socket(server);

io.on('connection', (socket) => {
  socket.emit('serverMessage', messages);
  socket.on('clientMessage', ({message}) => {
    messages.push({message, id: socket.id});
    console.log('I have new message: ', message );
    socket.broadcast.emit('serverMessage', messages);
  });
  socket.on('clientMessageDelete', (upDatedMessages) => {
    messages = upDatedMessages;
    socket.broadcast.emit('serverMessage', messages);
  });
});
