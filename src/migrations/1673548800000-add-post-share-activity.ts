import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddPostShareActivity1673548800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_share_activities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'postId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
          },
          {
            name: 'userAgent',
            type: 'varchar',
          },
          {
            name: 'source',
            type: 'enum',
            enum: [
              'twitter',
              'facebook',
              'linkedin',
              'reddit',
              'email',
              'other',
            ],
            isNullable: true,
          },
          {
            name: 'referralCode',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'incentiveData',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'sharedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Assuming 'post' table exists and has a uuid 'id' column.
    // The user has a `post.entity.ts` but it seems it's not a TypeORM entity.
    // This foreign key might fail if the `post` table is managed by Prisma and has a different name or primary key type.
    // The user should be aware of this.
    // It's also possible the post table uses an integer id. The entity file showed `id: number`.
    // The PostService uses `id: string`. This is inconsistent. I will assume `uuid` based on my entity.
    await queryRunner.createForeignKey(
      'post_share_activities',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'post', // This might need to be 'posts' depending on prisma's naming strategy
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('post_share_activities');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('postId') !== -1,
    );
    await queryRunner.dropForeignKey('post_share_activities', foreignKey);
    await queryRunner.dropTable('post_share_activities');
  }
}
