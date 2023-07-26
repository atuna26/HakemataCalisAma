const path = require("path")
const express = require("express")
const exphbs = require("express-handlebars")
const app = express()
const bodyParser = require("body-parser")
const port = 3000
const hostname = "127.0.0.1"
const mongoose = require("mongoose")
const expressSession = require("express-session")
const connectMongo = require("connect-mongo")
const methodOverride = require("method-override")
const helpers = require('handlebars-helpers');
const moment = require('moment');
mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://alperentuna26:ormVStovLdVRQyUk@atuna.uqlxl3k.mongodb.net/hakematadb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const mongoStore = connectMongo(expressSession)

app.use(expressSession({
    secret: "testotesto",
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

// Flash - Message middleware

app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionFlash
    next()
})

app.use(express.static("public"))
app.use(methodOverride('_method'))

const hbs = exphbs.create({
    helpers: {
        any: function() {
            let options = arguments[arguments.length - 1];
            let args = Array.prototype.slice.call(arguments, 0, -1);
            for (let i = 0; i < args.length; i++) {
                if (args[i]) {
                    if (options.fn) {
                        return options.fn(this);
                    } else {
                        return args[i];
                    }
                }
            }
            if (options.inverse) {
                return options.inverse(this);
            }
        },
        
        concat: function (str1, str2) {
            return str1 + str2;
        },
        times: function(n, block) {
            let accum = '';
            for (let i = 1; i <= n; ++i)
                accum += block.fn(i);
            return accum;
        },
        eqIds: function (id1, id2) {
            return id1.equals(id2);
        },
        eq: function (a, b) {
            return a === b;
        },
        add: function (value,addition){
            return parseInt(value) + parseInt(addition)
        },
        moment: function(date) {
            return moment(date).format("YYYY-MM-DD");
        },

    }
});

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const users = require("./routes/users")
const { group } = require("console")
app.use("/users", users)

app.use((req, res, next) => {
    if (req.session.userId) {
        const main = require("./routes/main")
        const referee = require("./routes/referee")
        const team = require("./routes/team")
        const league = require("./routes/league")
        const fixture = require("./routes/fixture")
        const optimization = require("./routes/optimization")
        app.use("/", main)
        app.use("/ayarlar/referee", referee)
        app.use("/ayarlar/team", team)
        app.use("/ayarlar/league", league)
        app.use("/ayarlar/fixture", fixture)
        app.use("/optimizasyon", optimization)
    } else {
        res.redirect("/users/login")
    }
    next();
})
app.listen(process.env.PORT || 3000);
//app.listen(port, () => console.log(`Example app listening ${hostname}:${port}`))