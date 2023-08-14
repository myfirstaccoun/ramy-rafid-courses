const express = require("express");
const app = express();
const port = 1513;
// const helmet = require("helmet");
// app.use(helmet()); 
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
const utf8 = require('utf8');

// const Works = require("./models/theSchema");
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// lesson info
const lessons = require('./routes/theInfo');
app.use(lessons);



/****
live refresh
****/
const path = require("path");
const livereload = require("livereload");
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
/****
end of live refresh
****/


const connectLivereload = require("connect-livereload");
app.use(connectLivereload());
app.use("/public", express.static(path.join(__dirname, 'public')));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});