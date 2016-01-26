var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT= process.env.PORT || 3000;

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
	var matchingTodo;

	todos.forEach(function (todo){
		if(todo.id === todoId) {
			matchingTodo = todo;
		}

	});

	if(matchingTodo) {
		res.json(matchingTodo);
	} else {
		res.status(404).send();
	}

});

app.post('/todos',function(req,res){
	var body = req.body;
	body.id= todoNextId++;

	todos.push(body);

	res.json(body);

});

app.listen(PORT, function(){
	console.log('Express listening on port '+ PORT+'!');
});