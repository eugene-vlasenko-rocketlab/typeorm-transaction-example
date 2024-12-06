import { injectable, inject } from "tsyringe";
import { DataSource, QueryRunner } from "typeorm";
import { Profile } from "@src/entities/profile.entity";

@injectable()
export class ProfileService {
  constructor(@inject("DataSource") private readonly dataSource: DataSource) {}

  async createProfile(
    data: { userId: number; bio: string },
    queryRunner?: QueryRunner
  ): Promise<Profile> {
    const manager = queryRunner ? queryRunner.manager : this.dataSource.manager;

    const profile = new Profile();
    profile.userId = data.userId;
    profile.bio = data.bio;

    return await manager.save(profile);
  }
}
