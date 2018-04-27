const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/dist/`));
app.use(express.static(`${__dirname}/images/`));


app.use((err, req, res, next) => {
    console.log(err, next);
    res.status(500).send(err);
});

app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.use((req, res) => {
    res.status(404).send(404);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
