CREATE TABLE IF NOT EXISTS environments_previous (
	uuid TEXT NOT NULL,
	key TEXT NOT NULL,
	value TEXT NOT NULL,
	project TEXT NOT NULL,
	deprecated INTEGER NOT NULL
);

INSERT INTO environments_previous
SELECT * FROM environments;

DROP TABLE IF EXISTS environments; --- SQLite does not allow adding a primary key after the fact

ALTER TABLE environments_previous RENAME TO environments;