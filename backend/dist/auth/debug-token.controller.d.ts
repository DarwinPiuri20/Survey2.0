import { JwtService } from '@nestjs/jwt';
export declare class DebugTokenController {
    private jwtService;
    constructor(jwtService: JwtService);
    debugToken(headers: any, req: any): {
        success: boolean;
        message: string;
        headers: {
            authorization: any;
            'content-type': any;
        };
        method: any;
        path: any;
        tokenProvided?: undefined;
        tokenDecoded?: undefined;
        verificationSuccess?: undefined;
        verificationError?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        tokenProvided: boolean;
        tokenDecoded: any;
        verificationSuccess: boolean;
        verificationError: any;
        headers: {
            authorization: string;
            'content-type'?: undefined;
        };
        message?: undefined;
        method?: undefined;
        path?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        headers?: undefined;
        method?: undefined;
        path?: undefined;
        tokenProvided?: undefined;
        tokenDecoded?: undefined;
        verificationSuccess?: undefined;
        verificationError?: undefined;
    };
    verifyTokenManually(body: any): {
        success: boolean;
        message: string;
        tokenDecoded?: undefined;
        verificationSuccess?: undefined;
        verificationError?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        tokenDecoded: any;
        verificationSuccess: boolean;
        verificationError: any;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        tokenDecoded?: undefined;
        verificationSuccess?: undefined;
        verificationError?: undefined;
    };
}
