const request = require('supertest');
const app = require('../../app'); // Importa a aplicação Express

describe('Testando os endpoints', () => {
    beforeEach(() => {
        // Resetar mock da conexão ao banco de dados antes de cada teste
        global.conn = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
    });

    test('Deve fazer login com sucesso', async () => {
        const mockUser = {
            id: 1,
            nome: 'Test User',
            email: 'test@example.com',
            dat_nascimento: '2000-01-01',
            senha: 'password123'
        };

        global.conn.query.mockResolvedValueOnce({
            recordset: [mockUser]
        });

        const response = await request(app)
            .get('/login')
            .query({ email: 'test@example.com', senha: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            autenticado: true,
            userInfo: mockUser
        });
    });

    test('Deve falhar ao fazer login com credenciais incorretas', async () => {
        global.conn.query.mockResolvedValueOnce({
            recordset: []
        });

        const response = await request(app)
            .get('/login')
            .query({ email: 'wrong@example.com', senha: 'wrongpassword' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ autenticado: false });
    });
    
    test('Deve retornar 500 em caso de erro interno ao cadastrar', async () => {
        global.conn.query.mockRejectedValueOnce(new Error('Erro interno no servidor'));

        const erroUsuario = {
            nome: 'Erro Usuário',
            email: 'erro@example.com',
            senha: 'senha123',
            dat_nascimento: '2000-01-01'
        };

        const response = await request(app)
            .post('/cadastro')
            .send(erroUsuario);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('mensagem', 'Erro interno no servidor');
    });

    test('Deve buscar filmes', async () => {
        global.conn.query.mockResolvedValueOnce({
            recordset: [{ id: 1, nome: 'Filme Teste' }]
        });

        const response = await request(app)
            .get('/filmes')
            .query({ nome: 'Filme Teste' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, nome: 'Filme Teste' }]);
    });

    test('Deve retornar 500 em caso de erro interno ao buscar filmes', async () => {
        global.conn.query.mockRejectedValueOnce(new Error('Erro interno no servidor'));

        const response = await request(app)
            .get('/filmes')
            .query({ nome: 'Qualquer Nome' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('mensagem', 'Erro interno no servidor');
    });

    test('Deve excluir um usuário com sucesso', async () => {
        global.conn.query.mockResolvedValueOnce({ rowsAffected: [1] });

        const response = await request(app)
            .delete('/usuario/1')
            .send({ senha: 'senha123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('mensagem', 'Conta excluída com sucesso.');
    });

    test('Deve retornar 401 ao tentar excluir um usuário com senha incorreta', async () => {
        global.conn.query.mockResolvedValueOnce({ rowsAffected: [0] });

        const response = await request(app)
            .delete('/usuario/1')
            .send({ senha: 'senha_errada' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('mensagem', 'Senha incorreta ou usuário não encontrado.');
    });

    test('Deve retornar 500 em caso de erro interno ao excluir usuário', async () => {
        global.conn.query.mockRejectedValueOnce(new Error('Erro interno no servidor'));

        const response = await request(app)
            .delete('/usuario/1')
            .send({ senha: 'senha123' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('mensagem', 'Erro interno no servidor');
    });

    test('Deve atualizar um usuário com sucesso', async () => {
        global.conn.query.mockResolvedValueOnce({ rowsAffected: [1] });

        const response = await request(app)
            .put('/usuario/1')
            .send({ nome: 'Novo Nome', senha: 'novaSenha123', dat_nascimento: '1990-01-01', email: 'novoemail@example.com' });

        expect(response.status).toBe(204);
    });

    test('Deve retornar 200 se nenhum dado foi alterado ao atualizar usuário', async () => {
        global.conn.query.mockResolvedValueOnce({ rowsAffected: [0] });
    
        const response = await request(app)
            .put('/usuario/999')
            .send({ nome: 'Novo', senha: 'novaS', dat_nascimento: '2000-01-01', email: 'novoemail@exam.com' });
    
        expect(response.status).toBe(200);
    });

    test('Deve retornar 500 em caso de erro interno ao atualizar usuário', async () => {
        global.conn.query.mockRejectedValueOnce(new Error('Erro interno no servidor'));

        const response = await request(app)
            .put('/usuario/1')
            .send({ nome: 'Novo Nome', senha: 'novaSenha123', dat_nascimento: '1990-01-01', email: 'novoemail@example.com' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('mensagem', 'Erro interno no servidor');
    });

    test('Deve retornar 500 em caso de erro interno no login', async () => {
        global.conn.query.mockRejectedValueOnce(new Error('Erro interno no servidor'));

        const response = await request(app)
            .get('/login')
            .query({ email: 'test@example.com', senha: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('mensagem', 'Erro interno no servidor');
    });

    test('Deve retornar 400 se faltar campos obrigatórios no cadastro', async () => {
        const usuarioSemCamposObrigatorios = {
            nome: 'Usuário Sem Campos Obrigatórios'
            // Faltando campos obrigatórios: senha, dat_nascimento, email
        };

        const response = await request(app)
            .post('/cadastro')
            .send(usuarioSemCamposObrigatorios);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('mensagem', 'Nome, senha, data de nascimento e email são campos obrigatórios.');
    });

    test('Deve retornar 400 se o cliente tiver menos de 18 anos no cadastro', async () => {
        const clienteMenorIdade = {
            nome: 'Cliente Menor',
            email: 'menoridade@example.com',
            senha: 'senha123',
            dat_nascimento: '2010-01-01' // Menos de 18 anos
        };

        const response = await request(app)
            .post('/cadastro')
            .send(clienteMenorIdade);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('mensagem', 'Erro: O cliente deve ter no mínimo 18 anos.');
    });

    test('Deve retornar 400 se o email já estiver cadastrado no cadastro', async () => {
        const usuarioExistente = {
            nome: 'Usuário Existente',
            email: 'existente@example.com',
            senha: 'senha123',
            dat_nascimento: '1990-01-01'
        };

        global.conn.query.mockResolvedValueOnce({
            recordset: [{ id: 1 }] // Simula retorno de usuário existente
        });

        const response = await request(app)
            .post('/cadastro')
            .send(usuarioExistente);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('mensagem', 'Erro: O email já está cadastrado.');
    });

    test('Deve cadastrar um usuário com sucesso', async () => {
        global.conn.query
            .mockResolvedValueOnce({ recordset: [] }) // Simula que o email não está cadastrado ainda
            .mockResolvedValueOnce({}); // Simula a inserção do usuário

        const response = await request(app)
            .post('/cadastro')
            .send({
                nome: 'Novo Usuário',
                email: 'novo@example.com',
                senha: 'senha123',
                dat_nascimento: '1990-01-01', // Data de nascimento válida
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('mensagem', 'Cliente registrado com sucesso.');
    });

    test('Deve retornar 200 com mensagem "Nenhum dado foi alterado." se nenhum campo for fornecido ao atualizar usuário', async () => {
        global.conn.query.mockResolvedValueOnce({ rowsAffected: [0] });

        const response = await request(app)
            .put('/usuario/1')
            .send({}); // Enviar um objeto vazio para simular nenhum campo alterado

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('mensagem', 'Nenhum dado foi alterado.');
    });

    test('Deve buscar todos os filmes quando nenhum filtro é fornecido', async () => {
        global.conn.query.mockResolvedValueOnce({
            recordset: [{ id: 1, nome: 'Filme Teste' }, { id: 2, nome: 'Outro Filme' }]
        });
    
        const response = await request(app)
            .get('/filmes')
            .query({}); // Sem filtro
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { id: 1, nome: 'Filme Teste' },
            { id: 2, nome: 'Outro Filme' }
        ]);
    });

    test('Deve retornar 400 se email ou senha não forem fornecidos', async () => {
        const response = await request(app)
            .get('/login')
            .query({}); // Não fornecer email e senha intencionalmente
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ mensagem: 'Email e senha são obrigatórios para login.' });
    });
    
});
