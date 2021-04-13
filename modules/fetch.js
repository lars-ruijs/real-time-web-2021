const fetch = require('node-fetch');

async function getData(keyword) {
    const data = await fetch(`https://api.unsplash.com/search/photos/?client_id=${process.env.API_KEY}&query=${keyword}&per_page=1&order_by=popular`);
    const response = await data.json();
    return response;
}
  
module.exports = { getData };
  