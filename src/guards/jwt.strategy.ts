import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'nestjs-prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // enable req in validate()
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    // extract raw token to check revocation
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    console.log("rowToken",rawToken)
    console.log("request",req)
    if (!rawToken) {
      throw new UnauthorizedException('No token found');
    }
    // Check if token has been revoked
    const wasRevoked = await this.prisma.revokedToken.findUnique({
      where: { token: rawToken },
    });
    if (wasRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('User not found');

    // Strip sensitive fields before attaching to request
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...safeUser
    } = user;

    return safeUser;
  }
}

// JwtAuthGuard could be moved to its separate file and its references updated
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
