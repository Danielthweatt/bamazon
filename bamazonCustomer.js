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

function updateProductData(id, quantity, cost){
    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: quantity}, {item_id: id}], function(error){
        if (error) throw error;
        console.log(`Ok. That is $${cost}`);
        connection.end();
        console.log('Connection ended.');
    });
};

function inquireAboutQuantity(item){
    let quantity = item.stock_quantity;
    console.log(`There ${quantity === 1 ? 'is' : 'are'} ${quantity} "${item.item}"${quantity === 1 ? '' : 's'} in stock.`);
    inquirer.prompt([
        {
            type: 'input',
            message: 'How many would you like to purchase?',
            name: 'quantity'
        }
    ]).then(function(res){
        let answer = parseInt(res.quantity);
        if (answer > quantity) {
            console.log('Sorry! That is more than we have in stock.');
            inquireAboutQuantity(item);
        } else {
            updateProductData(item.id, (quantity - answer), (answer * item.price));            
        }
    }).catch(function(error){
        console.log(`Oh boy, it broke: ${error}`);
        connection.end();
        console.log('Connection ended.');
    });
};

function inquireAboutItem(itemsInStock){
    inquirer.prompt([
        {
            type: 'input',
            message: 'What would you like to purchase? (If nothing, enter "Nothing")',
            name: 'item'
        }
    ]).then(function(res){
        let answer = res.item.trim().toLowerCase();
        if (answer === 'nothing'){
            console.log('We look forward to seeing you soon.');
            connection.end();
            console.log('Connection ended.');
        } else {
            let item;
            let inStock = false;
            itemsInStock.forEach(function(row){
                item = row.product_name.toLowerCase();
                if (item === answer) {
                    if (row.stock_quantity > 0) {
                        inStock = true;
                        inquireAboutQuantity({
                            item: row.product_name, 
                            id: row.item_id, 
                            department: row.department_name,
                            stock_quantity: row.stock_quantity,
                            price: row.price
                        });
                    } else {
                        console.log("Sorry, we don't have that item in stock.");
                        inquireAboutItem();
                    }
                }
            });
            if (!inStock) {
                console.log("Sorry, we don't have that item. Make sure your spelling is accurate.");
                inquireAboutItem();
            }
        }
    }).catch(function(error){
        console.log(`Oh boy, it broke: ${error}`);
        connection.end();
        console.log('Connection ended.');
    });
};

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
        inquireAboutItem(result);
    });
};

// Function Calls

connection.connect(function(error){
    if (error) throw error;
    console.log('connected as id ' + connection.threadId);
    displayItemsForSale();
});