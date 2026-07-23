import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpRequestDto } from './dtos/request/sign-up-request.dto';
import { RedefinirSenhaService } from '../services/redefinir-senha.service';

@Controller()
export class RedefinirSenhaController {
  constructor(private readonly redefinirSenhaService: RedefinirSenhaService) {}

  @Post('/redefinir-senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() body: SignUpRequestDto): Promise<void> {
    this.redefinirSenhaService.execute(body.token, body.senha);
    return;
  }
}
