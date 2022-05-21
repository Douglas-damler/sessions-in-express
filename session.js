const express = require('express');
const session = require('express-session');
const app = express();

const PORT = process.env.PORT || 4001;

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}.`);
})