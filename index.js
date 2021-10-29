require("winston-mongodb");
const morgan = require("morgan");
const express = require("express")
const cors = require('cors')
const winston = require("winston");
const Table = require('cli-table');
const listAllRoutes = require('express-list-endpoints');
const contryStatePicker = require('country-state-picker');
const { JsonResponse } = require("./lib/apiResponse");
require('dotenv').config()


const app = express();
app.use(morgan('tiny'));
app.use(cors());

app.get("/countries", (req, res )=> {
    JsonResponse(res, 200, "Fetched", contryStatePicker.getCountries())
})

require('./startup/routes')(app);
require('./startup/db')()

const port = process.env.PORT || 3000;


let routesList = listAllRoutes(app);
routesList = routesList.map((route) => {
 const obj = {};
 obj[route.path] = route.methods.join(' | ');
 return obj;
});

const table = new Table();
table.push({ Endpoints: 'Methods' }, ...routesList);

console.log(`THESE ARE THE AVAILABLE ENDPOINTS: \n${table.toString()}`);

app.listen(port, () => {
    winston.info(`----Roomie-Service is running on http://localhost:${port}--------`)
})