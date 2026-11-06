export class ErroValidacao extends Error {
  constructor(erros) {
    super('Dados inválidos.');
    this.name = 'ErroValidacao';
    this.erros = erros;
  }
}
