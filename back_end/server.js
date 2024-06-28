const app = require('../back_end/app');

const port = 3000; // Defina a porta aqui

app.listen(port, () => {
    console.log('Servidor está rodando na porta ' + port);
});