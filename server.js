require('dotenv').config();
const express = require("express");
const app = express();
const TuyAPI = require('tuyapi');
const Govee = require("node-govee-led");

app.set("view engine", "ejs");

app.listen(3000);

//LIGHT
const light = new TuyAPI({
id: process.env.LIGHT_ID,
key: process.env.LIGHT_KEY});

light.find().then(() => {
    light.connect();
});

light.on('connected', () => {
    console.log('Connected to light!');
});

light.on('disconnected', () => {
    console.log('Disconnected from light.');
});

light.on('error', error => {
    console.log('Error with light!', error);
});

//DIFFUSER
/*
1: spray & light
11: light
103: spray mode (off, small, big)
110: light mode (1=gradient, 2=fixed, 3=nightlight)
108: color
*/
const diffuser = new TuyAPI({
id: process.env.DIFFUSER_ID,
key: process.env.DIFFUSER_KEY});

diffuser.find().then(() => {
    diffuser.connect();
});

diffuser.on('connected', () => {
    console.log('Connected to diffuser!');
});

diffuser.on('disconnected', () => {
    console.log('Disconnected from diffuser.');
});

diffuser.on('error', error => {
    console.log('Error with diffuser!', error);
});

const HexTiles = new Govee({
	apiKey: process.env.GOVEE_API_KEY,
	mac: process.env.HEX_TILES_MAC,
	model: process.env.HEX_TILES_MODEL
})

const Sconces = new Govee({
    apiKey: process.env.GOVEE_API_KEY,
	mac: process.env.SCONCES_MAC,
	model: process.env.SCONCES_MODEL
})

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/diffuser/:fn/:status", (req, res) => {
    switch(req.params.fn)
    {
        case "light":
            switch(req.params.status)
            {
                case "on":
                    diffuser.set({multiple: true, data: {"11": true, "110": "2", "108": "00ff00"}}).then((data) => console.log("Diffuser light turned on.", data));
                    break;
                
                case "off":
                    diffuser.set({dps: 11, set: false}).then((data) => console.log("Diffuser light turned off.", data));

                default:
                    break;
            }
            break;
        
        case "spray":
            switch(req.params.status)
            {
                case "on":
                    diffuser.set({dps: 103, set: "small"}).then((data) => console.log("Diffuser spray turned on.", data));
                    break;
                
                case "off":
                    diffuser.set({dps: 103, set: "off"}).then((data) => console.log("Diffuser spray turned off.", data));

                default:
                    break;
            }
            break;
        
        default:
            break;
    }
    
    res.status(204).send();
});

app.get("/data", (req, res) => {
    diffuser.get({schema: true}).then(data => console.log(data))
    res.status(204).send();
});

app.get("/light/:status", (req, res) => {
    switch(req.params.status)
    {
        case "off":
            light.set({dps: 20, set: false}).then((data) => console.log("Light turned off.", data));
            break;
        
        case "on":
            light.set({dps: 20, set: true}).then((data) => console.log("Light turned on.", data));
            break;
        
        default:
            break;
    }
    
    res.status(204).send();
});

app.get("/hextiles/:status", (req, res) => {
    switch(req.params.status)
    {
        case "off":
            HexTiles.turnOff().then((data) => {console.log(data, "HexTiles turned off.")});
            break;
        
        case "on":
            HexTiles.turnOn().then((data) => {console.log(data, "HexTiles turned on.")});
            break;
        
        default:
            break;
    }
    
    res.status(204).send();
});

app.get("/sconces/:status", (req, res) => {
    switch(req.params.status)
    {
        case "off":
            Sconces.turnOff().then((data) => {console.log(data, "Sconces turned off.")});
            break;
        
        case "on":
            Sconces.turnOn().then((data) => {console.log(data, "Sconces turned on.")});
            break;
        
        default:
            break;
    }
    
    res.status(204).send();
});