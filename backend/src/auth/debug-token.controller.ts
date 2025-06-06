import { Controller, Get, Headers, Post, Body, Req } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('debug-token')
export class DebugTokenController {
  constructor(private jwtService: JwtService) {}

  @Public()
  @Get()
  debugToken(@Headers() headers, @Req() req) {
    try {
      // Extraer el token del encabezado de autorización
      const authHeader = headers.authorization || '';
      const token = authHeader.split(' ')[1]; // Obtener el token después de "Bearer "
      
      if (!token) {
        return {
          success: false,
          message: 'No se proporcionó token',
          headers: {
            authorization: headers.authorization || 'No presente',
            // Incluir otros encabezados relevantes
            'content-type': headers['content-type'] || 'No presente',
          },
          method: req.method,
          path: req.url,
        };
      }
      
      // Decodificar el token sin verificar (solo para depuración)
      const decodedToken = this.jwtService.decode(token);
      
      // Intentar verificar el token
      let verifiedToken = null;
      let verificationError = null;
      
      try {
        verifiedToken = this.jwtService.verify(token);
      } catch (error) {
        verificationError = {
          name: error.name,
          message: error.message,
        };
      }
      
      return {
        success: !!verifiedToken,
        tokenProvided: !!token,
        tokenDecoded: decodedToken,
        verificationSuccess: !!verifiedToken,
        verificationError,
        headers: {
          authorization: headers.authorization ? 'Presente (primeros 20 caracteres): ' + headers.authorization.substring(0, 20) + '...' : 'No presente',
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  @Public()
  @Post('verify')
  verifyTokenManually(@Body() body) {
    try {
      const { token } = body;
      
      if (!token) {
        return {
          success: false,
          message: 'No se proporcionó token en el cuerpo de la solicitud',
        };
      }
      
      // Decodificar el token sin verificar
      const decodedToken = this.jwtService.decode(token);
      
      // Intentar verificar el token
      let verifiedToken = null;
      let verificationError = null;
      
      try {
        verifiedToken = this.jwtService.verify(token);
      } catch (error) {
        verificationError = {
          name: error.name,
          message: error.message,
        };
      }
      
      return {
        success: !!verifiedToken,
        tokenDecoded: decodedToken,
        verificationSuccess: !!verifiedToken,
        verificationError,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
