import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usuarioService } from '../src/pedidos-contratos/services/usuarioService.js';
import { ErroValidacao } from '../src/pedidos-contratos/regras/erros.js';

const usuarios = [{ id: '1', perfil: 'CLIENTE', nome: 'Ana', email: 'ana@email.com', senha: '123456' }];

globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => usuarios });

test('entrar devolve o usuário com e-mail e senha corretos', async () => {
  const usuario = await usuarioService.entrar('ANA@email.com ', '123456');
  assert.equal(usuario.id, '1');
});

test('entrar recusa senha errada com ErroValidacao', async () => {
  await assert.rejects(usuarioService.entrar('ana@email.com', 'errada'), ErroValidacao);
});

test('entrar recusa e-mail desconhecido', async () => {
  await assert.rejects(usuarioService.entrar('x@email.com', '123456'), ErroValidacao);
});
