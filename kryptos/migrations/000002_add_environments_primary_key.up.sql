CREATE TABLE IF NOT EXISTS environments_next (
	uuid TEXT NOT NULL,
	key TEXT NOT NULL,
	value TEXT NOT NULL,
	project TEXT NOT NULL,
	deprecated INTEGER NOT NULL,
	CONSTRAINT pk_environment PRIMARY KEY(uuid, key, project, deprecated)
);

INSERT INTO environments_next
SELECT * FROM environments;

DROP TABLE IF EXISTS environments; --- SQLite does not allow adding a primary key after the fact

ALTER TABLE environments_next RENAME TO environments;