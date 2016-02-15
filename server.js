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
	var query = req.query;
	var where = {};
	
	if(query.hasOwnProperty('completed') && query.completed === "true") {
		where.completed = true;
	} else if(query.hasOwnProperty('completed') && query.completed === "false" ) {
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%'+ query.q + '%'
		}
	}

	db.todo.findAll({where: where}).then(function(todos){
		res.json(todos);
	},function(e) {
		res.status(500).send();
	})
});

app.get('/todos/:id',function(req,res){

	var todoId = parseInt(req.params.id,10);
	db.todo.findById(todoId).then(function (todo){
		if(!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e){
		res.status(500).send();
	});
	// var matchingTodo = _.findWhere(todos,{id : todoId});

	// if(matchingTodo) {
	// 	res.json(matchingTodo);
	// } else {
	// 	res.status(404).send();
	// }

});

app.post('/todos',function(req,res){
	var body = _.pick(req.body,'description','completed');

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

app.delete('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id,10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted){
		if(rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with ID'
			});
		} else {
			res.status(204).send();
		}
	},function(){
		res.status(500).send();
	});
	// var matchingTodo = _.findWhere(todos,{id : todoId});
	// if(!matchingTodo) {
	// 	res.status(404).json({"error": "no todo found with that id"});
	// } else {
	// 	todos = _.without(todos,matchingTodo);
	// 	res.json(matchingTodo);
	// }
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

