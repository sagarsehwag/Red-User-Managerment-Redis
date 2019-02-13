const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const redis = require("redis");
const methodOverride = require("method-override");

// Initialising Express Middleware
const app = express();

// Redis Client
let client = redis.createClient();
client.on("connect", () => {
	console.log("Connected to Redis");
});

// General Middlewares ----------------------------------------------------------------------------

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serving Static Files
app.use(express.static(path.join(__dirname, "public")));

// MethodOverride Middleware
app.use(methodOverride("_method"));

// View Engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ------------------------------------------------------------------------------------------------

// Routes -----------------------------------------------------------------------------------------

app.get("/", (req, res) => {
	res.render("searchusers");
});

// Search User Route
app.post("/user/search", (req, res) => {
	let id = req.body.id;

	client.hgetall(id, (err, obj) => {
		if (!obj) {
			res.render("searchusers", {
				error: "User does not exist"
			});
		} else {
			obj.id = id;
			res.render("details", {
				user: obj
			});
		}
	});
});

// Add User Route
app.get("/user/add", (req, res) => {
	res.render("adduser");
});

// Process Add User Route
app.post("/user/add", (req, res) => {
	let { id, first_name, last_name, email, phone } = req.body;
	client.hmset(
		id,
		[
			"first_name",
			first_name,
			"last_name",
			last_name,
			"email",
			email,
			"phone",
			phone
		],
		(err, reply) => {
			if (err) {
				console.log(err);
			} else {
				console.log(reply);
				res.redirect("/");
			}
		}
	);
});

app.delete("/user/delete/:id", (req, res) => {
	client.del(req.params.id);
	res.redirect("/");
});

// ------------------------------------------------------------------------------------------------

// Server Intilisation ----------------------------------------------------------------------------
app.listen(5000, (error) => {
	console.log("Server Started on Port 5000");
});
