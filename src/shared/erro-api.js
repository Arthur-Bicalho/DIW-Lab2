export class ErroApi extends Error {
  constructor(mensagem, status = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}
