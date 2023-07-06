import {
	Column,
	ColumnOptions,
	ColumnType,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

const mysqlSqliteTypeMapping: { [key: string]: ColumnType } = {
	timestamptz: 'datetime',
};

export function resolveDbType(mySqlType: any): ColumnType {
	const isTestEnv = process.env.NODE_ENV === 'test';
	if (isTestEnv && mySqlType in mysqlSqliteTypeMapping) {
		return mysqlSqliteTypeMapping[mySqlType.toString()];
	}
	return mySqlType;
}

export function DbAwareColumn(columnOptions: ColumnOptions) {
	if (columnOptions.type) {
		columnOptions.type = resolveDbType(columnOptions.type);
	}
	return Column(columnOptions);
}

export function DbAwareCreateDateColumn(columnOptions: ColumnOptions) {
	if (columnOptions.type) {
		columnOptions.type = resolveDbType(columnOptions.type);
	}
	return CreateDateColumn(columnOptions);
}

export function DbAwareUpdateDateColumn(columnOptions: ColumnOptions) {
	if (columnOptions.type) {
		columnOptions.type = resolveDbType(columnOptions.type);
	}
	return UpdateDateColumn(columnOptions);
}
