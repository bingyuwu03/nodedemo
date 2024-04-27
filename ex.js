const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 8080; // 使用 Heroku 分配的动态端口，如果没有分配，则使用 8080

const connstr = "mongodb+srv://bingyuwu03:Qsrmmwubingyu123@cluster0.ncotu9a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

const server = http.createServer(async (req, res) => {
    console.log("Success");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const path = url.parse(req.url, true).pathname;
    if (path == "/") {
        const formHTML = `
            <form action="/process" method="get">
                <input type='text' name='search' placeholder='Enter Ticker or Company Name'>
                <br>
                <input type='radio' name='type' value='ticker' checked> Ticker Symbol
                <input type='radio' name='type' value='company'> Company Name
                <br>
                <input type='submit' value='Submit'>
            </form>`;
        res.write(formHTML);
        res.end();
    } else if (path == "/process") {
        const query = url.parse(req.url, true).query;
        const searchType = query.type;
        const searchTerm = query.search;

        try {
            const client = await MongoClient.connect(connstr);
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            let filter = {};
            if (searchType === 'ticker') {
                filter = { "Ticker": searchTerm };
            } else if (searchType === 'company') {
                filter = { "Company": searchTerm };
            }

            const companies = await collection.find(filter).toArray();
            res.write("<h2>Search Results:</h2>");
            companies.forEach(company => {
                res.write(`<p>Name: ${company.Company}, Ticker: ${company.Ticker}, Price: ${company.Price}</p>`);
            });

            console.log("Search Results:");
            console.log(companies);

            client.close();
            res.end();
        } catch (error) {
            console.error(error);
            res.write("An error occurred.");
            res.end();
        }
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
