// more steps to do before making any projcet
/*
step-1 = make a project directory, do initilize npm init and install neccessary modules like express, body parser, request etc( as per your need)
step-2 = require project through the install modules and write the basic things
step-3 = now using templating to get rid off using multiple html files again and again

*/





// jshint esversion:6
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(express.urlencoded({extended : true}));

const _ = require('lodash');

const mongoose  = require('mongoose');
mongoose.connect("mongodb://localhost : 27017/todolistDB", {useNewUrlParser : true, useUnifiedTopology : true, useFindAndModify : false});

// rather than this we are directly going to store it in a database :-
// --------------------------------------------------------------------
// let nayichizs = ["Buy Food",  "Cook Food", "Eat Food"];
// let workitems = [];
// -----------------------------------------------------------------------

const itemschema = {
    name : String,  
};

const Item = new mongoose.model("item", itemschema);

// new document basiclly to put in the item schema
const item1 = new Item({
    name : "welcome to our to do list"
});

const item2 = new Item({
    name : "hit the + button to add new item"
});

const item3 = new Item({
    name : "<-- hit this to delete any item"
});

const defaultitems = [item1, item2, item3];

// ----making a listschema----
const listschema = {
    name : String, 
    items : [itemschema]
};

// ----making a model----
const List = new mongoose.model("list", listschema);

// making a new document and making it in dynamic routing get request



// using insertmany function to insert all the item into the item collection
// Item.insertMany(defaultitems, function(err){
//     if(err)
//         console.log(err);
//     else
//         console.log('success and ur items are saved to the database');
// });

// using ejs (keep the syntax same)
app.set('view engine', 'ejs');
app.use(express.static("public"));

const date = require(__dirname + '/date.js');

app.get('/', (req, res) =>{
    
    Item.find({}, function(err, founditems){

        if(!founditems.length){
            Item.insertMany(defaultitems, function(err){
                if(err)
                    console.log(err);
                else
                    console.log('success and ur items are saved to the database');
            });
            res.redirect('/');
        } else{
            res.render("list", {
                listTitle : date.getDate, 
                newlistitem : founditems
            });
        }
    });
});

// lets play with the routing parameters
app.get('/:customListName', (req, res) =>{
    const customListName  =  _.capitalize(req.params.customListName);

    List.findOne({name : customListName}, function(err, results){
        if(!err){
            if(!results){
                // create a new lists
                const list = new List({
                    name : customListName, 
                    items : defaultitems
                });
            
                list.save();
                res.redirect('/' + customListName);
            } else {
                // show already created lists
                res.render('list', {
                    listTitle : results.name, 
                    newlistitem : results.items
                });
            } 
        }
    });
});


app.post('/', (req, res) =>{

    let nayichiz = req.body.newItem;
    const Listtitle = req.body.list;
    const newitem = new Item({
        name : nayichiz
    });

    let todaysdate = date.getDate;
    if(Listtitle == todaysdate){
        newitem.save();
        res.redirect('/');
    } else {
        List.findOne({name : Listtitle}, function(err, result){
            if(!err){
                    result.items.push(newitem);
                    result.save();
                    res.redirect('/' + result.name);
            }
        });
    }
});



app.post('/delete', (req, res) =>{
    const checkeditem = req.body.checkbox;
    let listname = req.body.listname;

    let todaysdate = date.getDate;
    if(listname === todaysdate){
        Item.findByIdAndRemove(checkeditem, function(err){
            if(err)
                console.log(err);
            else{
                console.log("successfully deleted");
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndDelete({name : listname}, {$pull : {items : {_id : checkeditem}}}, function(err, result){
            if(!err)
                res.redirect('/' + listname);
        });
    }
});

app.get('/about', (req, res) =>{
    res.render('about');
});

app.listen(3000, () =>{
    console.log('listening on the port 3000....');
});

