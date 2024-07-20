import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/users.schema";
import { PlutosUser } from "../types/plutos.type";
import { ValidUser } from "../types/user.type";


@Injectable()
export class PlutosService {

    constructor(
        @InjectModel(User.name) private usersModel: Model<User>,
    ) { }


    async createUser(user: ValidUser): Promise<ValidUser> {
        try {
            const response = await this.usersModel.create(user);
            return response as unknown as ValidUser || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }


}