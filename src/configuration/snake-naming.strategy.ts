import { DefaultNamingStrategy } from 'typeorm';
import type { NamingStrategyInterface, Table } from 'typeorm';

function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s.-]+/g, '_')
    .toLowerCase();
}

export default class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName || snakeCase(className);
  }

  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCase(embeddedPrefixes.concat(customName || propertyName).join('_'));
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(/\./gi, '_')}_${secondTableName}`,
    );
  }

  joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    return snakeCase(`${tableName}_${columnName || propertyName}`);
  }

  foreignKeyName(tableOrName: Table | string, columnNames: Array<string>, _referencedTablePath?: string, _referencedColumnNames?: Array<string>): string {
    tableOrName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    return `${tableOrName}_${columnNames.join('_')}_fkey`;
  }
}
