var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT= process.env.PORT || 3000;
var db = require('./db.js');


app.use(bodyParser.json());

var todos = [{
	id:1,
	description: "Meet me for lunch",
	completed: false
},{
	id:2,
	description: "Go to market",
	completed: false
},
{
	id:3,
	description: "Have tea",
	completed: false
}];
var todoNextId = 4;

app.get('/',function(req,res){
	res.send('To do API');
});

app.get('/todos',function(req,res){
	res.json(todos);
});

app.get('/todos/:id',function(req,res){

	var todoId = parseInt(req.params.id,10);
	var matchingTodo = _.findWhere(todos,{id : todoId});

	// todos.forEach(function (todo){
	// 	if(todo.id === todoId) {
	// 		matchingTodo = todo;
	// 	}

	// });

	if(matchingTodo) {
		res.json(matchingTodo);
	} else {
		res.status(404).send();
	}

});

app.post('/todos',function(req,res){
	var body = _.pick(req.body,'description','completed');

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
	// if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length == 0) {
	// 	return res.status(404).send();
	// }
	// body.description = body.description.trim();
	// body.id= todoNextId++;

	// todos.push(body);

	// res.json(body);

});

app.delete('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id,10);
	var matchingTodo = _.findWhere(todos,{id : todoId});
	if(!matchingTodo) {
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos,matchingTodo);
		res.json(matchingTodo);
	}
});

app.put('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id,10);
	var matchingTodo = _.findWhere(todos,{id:todoId});
	var body = _.pick(req.body,'description','completed');

	// console.log(validAtrributes);
	if(!matchingTodo) {
		return res.status(404).send();
	}

	var validAtrributes = {};
	if( body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAtrributes.completed = body.completed;
	} else if(body.hasOwnProperty('completed')) {
		return res.status(404).send();
	}

	if( body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0 ) {
		validAtrributes.description = body.description;
	} else if(body.hasOwnProperty('description')) {
		return res.status(404).send();
	}

	_.extend(matchingTodo,validAtrributes);
	res.json(matchingTodo);
});

db.sequelize.sync().then(function(){
	app.listen(PORT, function(){
	console.log('Express listening on port '+ PORT+'!');
	});
});

