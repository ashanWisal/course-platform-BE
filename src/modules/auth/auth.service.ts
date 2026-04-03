import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      role: dto.role,
    });

    const token = this.signToken(user);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-password_hash');
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private signToken(user: UserDocument) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }
}