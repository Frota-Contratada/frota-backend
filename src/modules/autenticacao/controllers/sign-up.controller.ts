import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpRequestDto } from '../dtos/request/sign-up-request.dto';

@Controller()
export class SignUpController {
  constructor() {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() body: SignUpRequestDto): Promise<void> {
    return;
  }
}
