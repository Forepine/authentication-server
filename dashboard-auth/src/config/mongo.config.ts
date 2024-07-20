import { MongooseModule } from "@nestjs/mongoose";
import { Log, logsSchema } from "../schemas/logs.schema";
import { Role, roleSchema } from '../schemas/roles.schema'
import { User, userSchema } from "../schemas/users.schema";
import { Bank, banksSchema } from "../schemas/banks.schema";
import { Scope, ScopeSchema } from "../schemas/scopes.schema";
import { Module, moduleSchema } from '../schemas/modules.schema';
import { Organization, organizationSchema } from "../schemas/organizations.schema";

const MONGOCONFIG =
    [
        MongooseModule.forRoot('mongodb+srv://sumitplutos:WFcpFbKhHQQojTXI@auth-cluster.lgeip3q.mongodb.net/',
            {
                dbName: 'authDB',
                maxPoolSize: 10
            }
        ),
        MongooseModule.forFeature(
            [
                {
                    name: Organization.name, schema: organizationSchema
                },
                {
                    name: User.name, schema: userSchema
                },
                {
                    name: Role.name, schema: roleSchema
                },
                {
                    name: Module.name, schema: moduleSchema
                },
                {
                    name: Scope.name, schema: ScopeSchema
                },
                {
                    name: Log.name, schema: logsSchema
                },
                {
                    name: Bank.name, schema: banksSchema
                }
            ]
        )
    ]

export default MONGOCONFIG;
