import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, employeeNumber: string, password: string) {
    const user = await this.prisma.employee.findUnique({
      where: { email },
    });

    if (!user || user.employeeNumber !== employeeNumber || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email, employee number, or password');
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
      username: user.name,
      role: user.role,
    };
  }

  async validateCustomer(email: string, threeLetter: string, password: string) {
    const customer = await this.prisma.customer.findUnique({ where: { email } });
  
    if (!customer || customer.threeLetter !== threeLetter || !(await bcrypt.compare(password, customer.password))) {
      throw new UnauthorizedException('Invalid customer credentials');
    }
  
    return customer;
  }
  
  async loginCustomer(customer: any) {
    const payload = { email: customer.email, sub: customer.id, role: 'customer', threeLetter: customer.threeLetter, contractTerm: customer.contractTerm, };
  
    return {
      access_token: this.jwtService.sign(payload),
      userId: customer.id,
      username: customer.name,
      role: 'customer',
      threeLetter: customer.threeLetter,       // ✅ 追加
      contractTerm: customer.contractTerm,     // ✅ 追加
    };
  }
}