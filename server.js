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
    
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
  
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    })
  });

app.get('/users/me', authenticate, (req, res) => {    //Using a middle ware for authenticate
    console.log(`Req=> ${req.user}`);
    res.send(req.user);
  });


app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
  
    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });
  
app.delete('/users/me/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
      res.status(200).send();
    }, () => {
      res.status(400).send();
    });
  });

  //====================================================================================

  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});