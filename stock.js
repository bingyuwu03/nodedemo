var http = require('http');
var url = require('url');
const { MongoClient } = require('mongodb');

const connstr = "your_connection_string_here";
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var path = url.parse(req.url, true).pathname;
    if (path == "/") {
        var formHTML = `
            <form action="/process" method="get">
                <input type='text' name='search' placeholder='Enter Ticker or Company Name'>
                <br>
                <input type='radio' name='type' value='ticker' checked> Ticker Symbol
                <input type='radio' name='type' value='company'> Company Name
                <br>
                <input type='submit' value='Submit'>
            </form>`;
        res.write(formHTML);
    } else if (path == "/process") {
        var query = url.parse(req.url, true).query;
        var searchType = query.type;
        var searchTerm = query.search;
        
        try {
            const db = await MongoClient.connect(connstr);
            const database = db.db(dbName);
            const collection = database.collection(collectionName);
            
            var filter = {};
            if (searchType === 'ticker') {
                filter = { "ticker": searchTerm };
            } else if (searchType === 'company') {
                filter = { "name": searchTerm };
            }
            
            const curs = collection.find(filter);
            const companies = await curs.toArray();
            
            res.write("<h2>Search Results:</h2>");
            companies.forEach(company => {
                res.write(`<p>Name: ${company.name}, Ticker: ${company.ticker}, Price: ${company.price}</p>`);
            });
            
            // Displaying data on the console
            console.log("Search Results:");
            console.log(companies);
            
            // Close the database connection
            db.close();
            
        } catch (error) {
            console.error(error);
            res.write("An error occurred.");
        }
    }
    res.end();
}).listen(8080);
