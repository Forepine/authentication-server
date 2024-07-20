import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { STATUS } from "../../enums/enum";
import { OrganizationService } from "../../organizations/organizations.service";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private orgService: OrganizationService,
    ) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromExtractors(
                    [
                        ExtractJwt.fromAuthHeaderAsBearerToken(),
                        ExtractJwt.fromUrlQueryParameter('token'),
                    ]
                ),
                ignoreExpiration: false,
                secretOrKey: process.env.JWT_SECRET,
                passReqToCallback: true,
            }
        );
    }

    async validate(req: Request, payload: any) {

        const gst = payload.gst;

        const org = await this.orgService.getOrganizationByGST(gst);

        if (!org) {
            throw new HttpException(
                `Unauthorized, Not exist`,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (org.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `Unauthorized, Account is not Active`,
                HttpStatus.UNAUTHORIZED
            );
        }

        return { ...org };
    }
}
