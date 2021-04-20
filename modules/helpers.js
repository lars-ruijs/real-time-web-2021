const fetch = require('node-fetch');

// Fetch data function
async function getData(keyword) {
    const data = await fetch(`https://api.unsplash.com/search/photos/?client_id=${process.env.API_KEY}&query=${keyword}&per_page=1&order_by=popular`);
    const response = await data.json();
    return response;
}

// Function to check if string does not contain special characters
// Source: https://stackoverflow.com/questions/11896599/javascript-code-to-check-special-characters/11896930
function isValid(str){
    return !/[~`!#$%\^&*+=\\[\]\\';,/{}|\\":<>\?]/g.test(str);
}
  
module.exports = { getData, isValid };
  