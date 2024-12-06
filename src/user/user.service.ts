import { injectable, inject } from "tsyringe";
import { DataSource, QueryRunner } from "typeorm";
import { User } from "@src/entities/user.entity";
import { ProfileService } from "@src/profile/profile.service";
import { withTransaction } from "@src/transaction-wrapper";

@injectable()
export class UserService {
  constructor(
    @inject("DataSource") private readonly dataSource: DataSource,
    private readonly profileService: ProfileService
  ) {}

  async createUserWithProfileNonTransactional(data: {
    name: string;
    email: string;
    bio: string;
  }) {
    let userId: number;
    try {
      const user = await this.createUser({ name: data.name, email: data.email });
      userId = user.id;

      throw new Error("Throwing error in non-transactional");

      const profile = await this.profileService.createProfile({
        userId: user.id,
        bio: data.bio,
      });

      return { user: { ...user, profile } };
    } catch (error) {
      const user = await this.getUserById(userId);
      throw {
        message: "Non-transactional operation failed",
        userCreated: user,
        originalError: error,
      };
    }
  }

  async createUserWithProfileTransactional(data: {
    name: string;
    email: string;
    bio: string;
  }) {
    let userId: number;
    try {
      const txResult = await withTransaction(
        this.dataSource,
        async (queryRunner) => {
          const user = await this.createUser(
            { name: data.name, email: data.email },
            queryRunner
          );
          userId = user.id;

          throw new Error("Throwing error in transaction");

          const profile = await this.profileService.createProfile(
            { userId: user.id, bio: data.bio },
            queryRunner
          );

          return { user, profile };
        }
      );

      return { user: { ...txResult.user, profile: txResult.profile } };
    } catch (error) {
      const user = await this.getUserById(userId);
      throw {
        message: "Transactional operation failed",
        userCreated: user,
        originalError: error,
      };
    }
  }

  private async createUser(
    data: { name: string; email: string },
    queryRunner?: QueryRunner
  ): Promise<User> {
    const manager = queryRunner ? queryRunner.manager : this.dataSource.manager;

    const user = new User();
    user.name = data.name;
    user.email = data.email;

    return await manager.save(user);
  }

  async getUserById(id: number): Promise<User> {
    const manager = this.dataSource.manager;
    return await manager.findOneBy(User, { id });
  }
}
