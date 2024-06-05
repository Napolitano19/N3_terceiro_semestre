const sql = require('mssql')
const express = require('express')
const path = require('path')
var cors = require('cors')

const app = express()
const port = 3000; // porta padrão
app.use(express.json())
app.use(cors())

// // Configurando o middleware para servir arquivos estáticos da pasta 'img'
// app.use(express.static(path.join(__dirname, 'img')));

const config = {
    server: 'KawanGabriel',
    database: 'violetview',
    port: 1433,
    user: 'sa',
    password: 'Acabana2009*',
    trustServerCertificate: true,
    options: {
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1',
            trustServerCertificate: true,
        },
    },
}

sql.connect(config)
    .then((conn) => {
        console.log('conectou')
        global.conn = conn
    })
    .catch((err) => {
        console.log(err)
    });

    function execSQLQuery(sqlQry, res){
        global.conn.request()
                    .query(sqlQry)
                    .then(result => res.json(result.recordset)) // EM caso de sucesso
                    .catch(err => res.json(err)) // em caso de erro
    }

// Endpoint para login
app.get('/login', (req, res) => {
    const { email, senha } = req.query; // Modificado para usar req.query

    const query = `SELECT id, nome, email, dat_nascimento, senha FROM cadastro WHERE email='${email}' AND senha='${senha}'`;

    global.conn.request()
        .query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                const userInfo = result.recordset[0]; // Supondo que apenas um usuário corresponda ao login
                res.json({
                    autenticado: true,
                    userInfo: userInfo
                });
            } else {
                res.json({ autenticado: false });
            }
        })
        .catch((err) => {
            res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message })
        });
});

app.get('/filmes', async (req, res) => {
    const { nome } = req.query;

    try {
        const pool = await global.conn;

        let query = 'SELECT * FROM filmes';

        if (nome) {
            // Se um nome foi fornecido, filtrar pelos filmes que tenham exatamente esse nome
            query += ' WHERE nome = @nome';
        }

        const result = await pool
            .request()
            .input('nome', nome) // Use o nome diretamente como parâmetro
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
    }
});


// Endpoint para cadastro
app.post('/cadastro', (req, res) => {
    const { nome, senha, dat_nascimento, email } = req.body;

    if (!nome || !senha || !dat_nascimento || !email) {
        return res.status(400).json({ mensagem: 'Nome, senha, data de nascimento e email são campos obrigatórios.' });
    }

    const checkEmailQuery = `SELECT 1 FROM cadastro WHERE email='${email}'`;

    global.conn.request()
        .query(checkEmailQuery)
        .then((result) => {
            if (result.recordset.length > 0) {
                return res.status(400).json({ mensagem: 'Erro: O email já está cadastrado.' });
            }

            const currentDate = new Date();
            const idade = currentDate.getFullYear() - new Date(dat_nascimento).getFullYear();

            if (idade < 18) {
                return res.status(400).json({ mensagem: 'Erro: O cliente deve ter no mínimo 18 anos.' });
            }

            // Se o email não estiver cadastrado, realiza a inserção no banco de dados
            const insertQuery = `
                INSERT INTO cadastro (nome, senha, dat_nascimento, email)
                VALUES ('${nome}', '${senha}', '${dat_nascimento}', '${email}')
            `;

            global.conn.request()
                .query(insertQuery)
                .then(() => res.status(200).json({ mensagem: 'Cliente registrado com sucesso.' }))
                .catch((err) => res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message }));
        })
        .catch((err) => res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message }));
});


// Requisito 4 - Excluir cadastro por ID
app.delete('/usuario/:id', async (req, res) => {
    const id = req.params.id;
    const { senha } = req.body;

    try {
        const pool = await global.conn;

        const deleteResult = await pool
            .request()
            .input('id', id)
            .input('senha', senha)
            .query(`
                DELETE FROM cadastro
                WHERE id = @id AND senha = @senha
            `);

        if (deleteResult.rowsAffected[0] > 0) {
            return res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
        } else {
            return res.status(401).json({ mensagem: 'Senha incorreta ou usuário não encontrado.' });
        }
    } catch (err) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
    }
});

// ATUALIZAÇÃO
app.put('/usuario/:id', async (req, res) => {
    const id = req.params.id;
    const { nome, senha, dat_nascimento, email } = req.body;

    try {
        const pool = await global.conn;

        // Convertendo a data para o formato aceito pelo banco de dados
        const formattedDate = new Date(dat_nascimento).toISOString();

        // Construir a parte SET da consulta com base nos campos fornecidos
        const updateFields = [];
        if (nome) updateFields.push(`nome = @nome`);
        if (senha) updateFields.push(`senha = @senha`);
        if (dat_nascimento) updateFields.push(`dat_nascimento = @dat_nascimento`);
        if (email) updateFields.push(`email = @email`);

        // Se nenhum campo fornecido, retornar uma resposta indicando que nenhum dado foi alterado
        if (updateFields.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum dado foi alterado.' });
        }

        const updateResult = await pool
        .request()
        .input('id', id)
        .input('nome', nome)
        .input('senha', senha)
        .input('dat_nascimento', formattedDate) // Utilizando a data formatada
        .input('email', email)
        .query(`
        UPDATE cadastro
        SET nome = @nome, senha = @senha, dat_nascimento = @dat_nascimento, email = @email
        WHERE id = @id
    `);

        if (updateResult.rowsAffected[0] > 0) {
            // Alterado com sucesso
            return res.status(204).end(); // ou res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
        } else {
            // Nenhum dado foi alterado
            return res.status(200).json({ mensagem: 'Nenhum dado foi alterado.' });
        }
    } catch (err) {
        console.error('Erro no servidor:', err);
        return res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
    }
});
          
app.listen(port, () => {
    console.log('Servidor está rodando na porta ' + port)
})