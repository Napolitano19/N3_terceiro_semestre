const express = require('express');
const cors = require('cors');
const sql = require('mssql'); // Certifique-se de ter o pacote mssql instalado
const app = express();


app.use(express.json());
app.use(cors());

// Endpoint para login
app.get('/login', (req, res) => {
    const { email, senha } = req.query;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios para login.' });
    }

    const query = `SELECT id, nome, email, dat_nascimento, senha FROM cadastro WHERE email=@Email AND senha=@Senha`;

    global.conn.request()
        .input('Email', sql.VarChar, email)
        .input('Senha', sql.VarChar, senha)
        .query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                const userInfo = result.recordset[0];
                res.json({
                    autenticado: true,
                    userInfo: userInfo
                });
            } else {
                res.json({ autenticado: false });
            }
        })
        .catch(err => {
            res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
        });
});

// Endpoint para filmes
app.get('/filmes', async (req, res) => {
    const { nome } = req.query;

    try {
        const pool = await global.conn;

        let query = 'SELECT * FROM filmes';
        if (nome) {
            query += ' WHERE nome = @Nome';
        }

        const result = await pool.request()
            .input('Nome', sql.VarChar, nome)
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
    }
});

// Endpoint para cadastro
app.post('/cadastro', async (req, res) => {
    const { nome, senha, dat_nascimento, email } = req.body;

    if (!nome || !senha || !dat_nascimento || !email) {
        return res.status(400).json({ mensagem: 'Nome, senha, data de nascimento e email são campos obrigatórios.' });
    }

    const currentDate = new Date();
    const birthDate = new Date(dat_nascimento);
    const idade = currentDate.getFullYear() - birthDate.getFullYear();

    if (idade < 18) {
        return res.status(400).json({ mensagem: 'Erro: O cliente deve ter no mínimo 18 anos.' });
    }

    try {
        const checkEmailQuery = `SELECT 1 FROM cadastro WHERE email=@Email`;
        const result = await global.conn.request()
            .input('Email', sql.VarChar, email)
            .query(checkEmailQuery);

        if (result.recordset.length > 0) {
            return res.status(400).json({ mensagem: 'Erro: O email já está cadastrado.' });
        }

        const insertQuery = `
            INSERT INTO cadastro (nome, senha, dat_nascimento, email)
            VALUES (@Nome, @Senha, @DataNascimento, @Email)
        `;
        await global.conn.request()
            .input('Nome', sql.VarChar, nome)
            .input('Senha', sql.VarChar, senha)
            .input('DataNascimento', sql.Date, dat_nascimento)
            .input('Email', sql.VarChar, email)
            .query(insertQuery);

        res.status(200).json({ mensagem: 'Cliente registrado com sucesso.' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno no servidor', error: error.message });
    }
});

// Endpoint para excluir cadastro por ID
app.delete('/usuario/:id', async (req, res) => {
    const id = req.params.id;
    const { senha } = req.body;

    try {
        const pool = await global.conn;

        const deleteResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('Senha', sql.VarChar, senha)
            .query(`
                DELETE FROM cadastro
                WHERE id = @Id AND senha = @Senha
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

// Endpoint para atualizar cadastro
app.put('/usuario/:id', async (req, res) => {
    const id = req.params.id;
    const { nome, senha, dat_nascimento, email } = req.body;

    try {
        const pool = await global.conn;

        const updateFields = [];
        if (nome) updateFields.push(`nome = @Nome`);
        if (senha) updateFields.push(`senha = @Senha`);
        if (dat_nascimento) updateFields.push(`dat_nascimento = @DataNascimento`);
        if (email) updateFields.push(`email = @Email`);

        if (updateFields.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum dado foi alterado.' });
        }

        const updateQuery = `
            UPDATE cadastro
            SET ${updateFields.join(', ')}
            WHERE id = @Id
        `;

        const updateResult = await pool.request()
            .input('Id', sql.Int, id)
            .input('Nome', sql.VarChar, nome)
            .input('Senha', sql.VarChar, senha)
            .input('DataNascimento', sql.Date, dat_nascimento)
            .input('Email', sql.VarChar, email)
            .query(updateQuery);

        if (updateResult.rowsAffected[0] > 0) {
            return res.status(204).end();
        } else {
            return res.status(200).json({ mensagem: 'Nenhum dado foi alterado.' });
        }
    } catch (err) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor', error: err.message });
    }
});


module.exports = app;