import { LoaderOptions, Logger, ModulesSdkTypes } from "@medusajs/types"

import { EntitySchema } from "@mikro-orm/core"
import { upperCaseFirst } from "../../common"
import { loadDatabaseConfig } from "../load-module-database-config"
import { mikroOrmCreateConnection } from "../../dal"

/**
 * Utility function to build a migration script that will revert the migrations.
 * Only used in mikro orm based modules.
 * @param moduleName
 * @param models
 * @param pathToMigrations
 */
export function buildRevertMigrationScript({
  moduleName,
  models,
  pathToMigrations,
}) {
  /**
   * This script is only valid for mikro orm managers. If a user provide a custom manager
   * he is in charge of reverting the migrations.
   * @param options
   * @param logger
   * @param moduleDeclaration
   */
  return async function ({
    options,
    logger,
  }: Pick<
    LoaderOptions<ModulesSdkTypes.ModuleServiceInitializeOptions>,
    "options" | "logger"
  > = {}) {
    logger ??= console as unknown as Logger

    const dbData = loadDatabaseConfig(moduleName, options)!
    const entities = Object.values(models) as unknown as EntitySchema[]

    const orm = await mikroOrmCreateConnection(
      dbData,
      entities,
      pathToMigrations
    )

    try {
      const migrator = orm.getMigrator()
      await migrator.down()

      logger?.info(`${upperCaseFirst(moduleName)} module migration executed`)
    } catch (error) {
      logger?.error(
        `${upperCaseFirst(
          moduleName
        )} module migration failed to run - Error: ${error}`
      )
    }

    await orm.close()
  }
}
