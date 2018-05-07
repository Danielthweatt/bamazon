// Modules

const mysql = require('mysql');
const inquirer = require('inquirer');

// MYSQL Connection

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'bamazon'
});

// Function Declarations

function displayItemsForSale(){
    connection.query("SELECT * FROM products", function(error, result){
        if (error) throw error;
        let count = 0;
        console.log('Items For Sale:');
        result.forEach(function(row){
            console.log(' ________________________________');
            console.log(` Product: ${row.product_name}`);
            console.log(` ID: ${row.item_id}`);
            console.log(` Price: $${row.price}`);
            count++;
        });
        if (count === 0) {
            console.log('Sorry. There is nothing currently in stock.');
        };
        connection.end();
        console.log('Connection ended.');
    });
};

// Function Calls

connection.connect(function(error){
    if (error) throw error;
    console.log('connected as id ' + connection.threadId);
    displayItemsForSale();
});