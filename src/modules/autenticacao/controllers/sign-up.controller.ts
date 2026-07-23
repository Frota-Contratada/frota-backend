import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpRequestDto } from './dtos/request/sign-up-request.dto';
import { SignUpService } from '../services/sign-up.service';

@Controller()
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() body: SignUpRequestDto): Promise<void> {
    this.signUpService.execute(body.token, body.senha);
    return;
  }
}
