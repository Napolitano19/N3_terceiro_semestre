const request = require('supertest');
const sql = require('mssql');
const app = require('../../app');

// Mock da conexão com o banco de dados
jest.mock('mssql');

describe('Endpoints da API', () => {
    beforeAll(() => {
        global.conn = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        sql.connect = jest.fn().mockResolvedValue(global.conn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });



    describe('GET /login', () => {
        it('deve retornar 400 se email ou senha não forem fornecidos', async () => {
            const res = await request(app).get('/login');
            expect(res.statusCode).toEqual(400);
            expect(res.body.mensagem).toEqual('Email e senha são obrigatórios para login.');
        });

        it('deve retornar informações do usuário se email e senha estiverem corretos', async () => {
            const mockUser = { id: 1, nome: 'Teste', email: 'teste@example.com', dat_nascimento: '2000-01-01', senha: '1234' };
            global.conn.request().query.mockResolvedValueOnce({ recordset: [mockUser] });

            const res = await request(app).get('/login').query({ email: 'teste@example.com', senha: '1234' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ autenticado: true, userInfo: mockUser });
        });

        it('deve retornar não autenticado se email ou senha estiverem incorretos', async () => {
            global.conn.request().query.mockResolvedValueOnce({ recordset: [] });

            const res = await request(app).get('/login').query({ email: 'teste@example.com', senha: 'wrong' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ autenticado: false });
        });

        it('deve retornar 500 se houver um erro no servidor', async () => {
            global.conn.request().query.mockRejectedValueOnce(new Error('Erro interno'));

            const res = await request(app).get('/login').query({ email: 'teste@example.com', senha: '1234' });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ mensagem: 'Erro interno no servidor', error: 'Erro interno' });
        });
    });

    describe('GET /filmes', () => {
        it('deve retornar todos os filmes', async () => {
            const mockFilmes = [{ id: 1, nome: 'Filme 1' }, { id: 2, nome: 'Filme 2' }];
            global.conn.request().query.mockResolvedValueOnce({ recordset: mockFilmes });

            const res = await request(app).get('/filmes');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockFilmes);
        });

        it('deve retornar filmes pelo nome', async () => {
            const mockFilme = [{ id: 1, nome: 'Filme 1' }];
            global.conn.request().query.mockResolvedValueOnce({ recordset: mockFilme });

            const res = await request(app).get('/filmes').query({ nome: 'Filme 1' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockFilme);
        });

        it('deve retornar 500 se houver um erro no servidor', async () => {
            global.conn.request().query.mockRejectedValueOnce(new Error('Erro interno'));

            const res = await request(app).get('/filmes').query({ nome: 'Filme 1' });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ mensagem: 'Erro interno no servidor', error: 'Erro interno' });
        });
    });

    describe('POST /cadastro', () => {
        it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
            const res = await request(app).post('/cadastro').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.mensagem).toEqual('Nome, senha, data de nascimento e email são campos obrigatórios.');
        });

        it('deve retornar 400 se o usuário for menor de 18 anos', async () => {
            const res = await request(app).post('/cadastro').send({ nome: 'Teste', senha: '1234', dat_nascimento: '2010-01-01', email: 'teste@example.com' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.mensagem).toEqual('Erro: O cliente deve ter no mínimo 18 anos.');
        });

        it('deve retornar 400 se o email já estiver registrado', async () => {
            global.conn.request().query.mockResolvedValueOnce({ recordset: [1] });

            const res = await request(app).post('/cadastro').send({ nome: 'Teste', senha: '1234', dat_nascimento: '2000-01-01', email: 'teste@example.com' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.mensagem).toEqual('Erro: O email já está cadastrado.');
        });

        it('deve registrar um novo usuário com sucesso', async () => {
            global.conn.request().query.mockResolvedValueOnce({ recordset: [] });
            global.conn.request().query.mockResolvedValueOnce({});

            const res = await request(app).post('/cadastro').send({ nome: 'Teste', senha: '1234', dat_nascimento: '2000-01-01', email: 'teste@example.com' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.mensagem).toEqual('Cliente registrado com sucesso.');
        });

        it('deve retornar 500 se houver um erro no servidor', async () => {
            global.conn.request().query.mockRejectedValueOnce(new Error('Erro interno'));

            const res = await request(app).post('/cadastro').send({ nome: 'Teste', senha: '1234', dat_nascimento: '2000-01-01', email: 'teste@example.com' });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ mensagem: 'Erro interno no servidor', error: 'Erro interno' });
        });
    });

    describe('DELETE /usuario/:id', () => {
        it('deve deletar um usuário com sucesso', async () => {
            global.conn.request().query.mockResolvedValueOnce({ rowsAffected: [1] });

            const res = await request(app).delete('/usuario/1').send({ senha: '1234' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.mensagem).toEqual('Conta excluída com sucesso.');
        });

        it('deve retornar 401 se a senha estiver incorreta ou usuário não encontrado', async () => {
            global.conn.request().query.mockResolvedValueOnce({ rowsAffected: [0] });

            const res = await request(app).delete('/usuario/1').send({ senha: 'wrong' });
            expect(res.statusCode).toEqual(401);
            expect(res.body.mensagem).toEqual('Senha incorreta ou usuário não encontrado.');
        });

        it('deve retornar 500 se houver um erro no servidor', async () => {
            global.conn.request().query.mockRejectedValueOnce(new Error('Erro interno'));

            const res = await request(app).delete('/usuario/1').send({ senha: '1234' });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ mensagem: 'Erro interno no servidor', error: 'Erro interno' });
        });
    });

    describe('PUT /usuario/:id', () => {
        it('deve atualizar as informações do usuário com sucesso', async () => {
            global.conn.request().query.mockResolvedValueOnce({ rowsAffected: [1] });

            const res = await request(app).put('/usuario/1').send({
                nome: 'Novo Nome',
                senha: '1234',
                dat_nascimento: '1990-01-01',
                email: 'novoemail@example.com'
            });
            expect(res.statusCode).toEqual(204);
        });

        it('deve retornar 200 se nenhum dado for alterado', async () => {
            global.conn.request().query.mockResolvedValueOnce({ rowsAffected: [0] });

            const res = await request(app).put('/usuario/1').send({});
            expect(res.statusCode).toEqual(200);
            expect(res.body.mensagem).toEqual('Nenhum dado foi alterado.');
        });
    });
});