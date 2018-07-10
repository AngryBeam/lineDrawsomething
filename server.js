console.log(`Starting Server with`);
require('./config/config');
//Main module to setting up HTTP server
const _ = require('lodash');
const express = require('express');
const hbs = require('hbs'); // it is middle ware template engine for handlebar view for express
const fs = require('fs');
const {ObjectID} = require('mongodb');
//const bodyParser = require('body-parser');

//Mongoose DB Connect
var {mongoose} = require('./libs/mongoose');
//Mongoose Model
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
//Middleware 
var {authenticate} = require('./libs/middleware/authentacate');

const port = process.env.PORT || 8000;
var app = express();
//====================================================================================
//set HBS partial (file template directory)
hbs.registerPartials(__dirname + '/views/partials'); 

//set express view using HBS
app.set('view engine', 'hbs');              // register the template engine
app.set('views', __dirname + '/views');     // specify the views directory

//app.use to set express use middileware
//app.use(bodyParser.json()); //Set express to use middleware body parser
app.use(express.json());
app.use(express.static(__dirname + '/public_html')); //set default web directory

//Access Log
app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    /* fs.appendFile(`./logs/${now}.log`, log + '\n', (e) => {
        if(e){ console.log('Unable to write server log: ' + e); }
    }); */
    next();
});
/* app.use((req, res, next) => {
    res.render('maintenance.hbs');
});
 */
//====================================================================================
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
})
//====================================================================================
/* app.get('/', (req,res) => {
    //res.send('Hello');
    res.send({
        name: 'Andrew',
        like: ['Bike', 'Swimming']
    });
});

app.get('/about', (req,res) => {
    //res.send('Hello');
    res.render('about.hbs', {
        pageTitle: 'Page Title About Page',
    });
}); */
//====================================================================================

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
      text: req.body.text,
      _creator: req.user._id
    });
  
    todo.save().then((doc) => {
      res.send(doc);
    }, (e) => {
      res.status(400).send(e);
    });
  });
  
  app.get('/todos', authenticate, (req, res) => {
    Todo.find({
      _creator: req.user._id
    }).then((todos) => {
      res.send({todos});
    }, (e) => {
      res.status(400).send(e);
    });
  });
  
  app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
  
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
  
    Todo.findOne({
      _id: id,
      _creator: req.user._id
    }).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
  
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
  });
  
  app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
  
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
  
    Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    }).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
  
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
  });
  
  app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
  
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
  
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
  
    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
  
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    })
  });

  
app.post('/users/register', (req, res) => {
    console.log('Incoming Data');
    console.log(JSON.stringify(req.body, null ,2));
    var body = _.pick(req.body, ['userId', 'channelId', 'displayName', 'pictureUrl']);
    /* var user = new User(body);
    user.save().then(() => {
      return User.findByChannelId(body.channelId);
    }).then((channelList) => {
      res.send({channelList});
    }).catch((e) => {
      res.status(400).send(e);
    }) */
 
    try {
      User.checkUserId(body.userId, body.channelId).then((haveUser) =>{
        console.log(`Checking UserID is already exist: ${haveUser.length}`);
        if(haveUser.length < 1){
          console.log(`New User Insert.`);
          var user = new User(body);
          user.save().catch((e) => {
              console.log(`Unable to save user: ${e}`);
          });
        }
      }).then(() =>{
        User.findByChannelId(body.channelId).then((channelList) => {
          res.send({channelList});
        });
      });
    } catch (e) {
      console.log(`Something Error: ${e}`);
    }

  });

app.post('/users/me', (req, res) => {    //Using a middle ware for authenticate
  var channelId = _.pick(req.body, ['channelId']);
  console.log(`User/me Incomming data:`);
  console.log(JSON.stringify(req.body, null ,2));
    try {
      User.findByChannelId(channelId).then((channelList) => {
        res.send({channelList});
      }).catch((e) =>{
        console.log(`Error -> User/me: ${e}`);
      });
    } catch (e) {
      res.send(e);
    }
  });

  app.post('/users/save', (req, res) => {    //Using a middle ware for authenticate
    console.log(JSON.stringify(req.body, null ,2));
    var body = _.pick(req.body, ['userId', 'channelId', 'gamePlay']);
    
    try {
      //User.checkUserId(body.userId, body.channelId).then((player) =>{
      User.findOneAndUpdate({ userId: body.userId, channelId: body.channelId}, { $push: {gamePlay: body.gamePlay}}).then(() => {
        console.log('Updating Player Game Play.');
        console.log(JSON.stringify(body, null, 2));
      }).catch ((e) => {
        console.log(`Unable to update user: ${e}`);
      });
      
    } catch (e) {
      res.send(e);
    }
    res.send('ok');
  });



  //====================================================================================

  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});