import { Connection } from 'typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { User } from '@leaa/common/entrys';
import { ConfigModule, envConfig } from '@leaa/api/modules/config/config.module';

import { GraphqlService } from '@leaa/api/modules/graphql/graphql.service';

// import { UserService } from '@leaa/api/modules/user/user.service';
import { UserModule } from '@leaa/api/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      connectTimeout: 10000,
      acquireTimeout: 10000,
      host: envConfig.MYSQL_HOST,
      port: envConfig.MYSQL_PORT,
      username: envConfig.MYSQL_USER,
      password: envConfig.MYSQL_PASSWORD,
      database: envConfig.MYSQL_DATABASE,
      // synchronize: false,
      synchronize: true,
      logging: true,
      entities: [
        // `${__dirname}/**/*.entity{.js,.ts}`,
        //
        // for @zeit/ncc import
        User,
      ],
    }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlService,
    }),
    ConfigModule,
    // RecipesModule,
    UserModule,
  ],
  providers: [
    // AppService,
    // UserService,
  ],
  controllers: [
    // AppController
  ],
})
export class AppModule {
  // constructor(private readonly connection: Connection) {}
}
