import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; employeeNumber: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.employeeNumber, body.password);
    return await this.authService.login(user); // ← 🔹ここに await を追加
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('customer-login')
async customerLogin(@Body() body: { email: string; threeLetter: string; password: string }) {
  const customer = await this.authService.validateCustomer(body.email, body.threeLetter, body.password);
  return await this.authService.loginCustomer(customer);
}
}