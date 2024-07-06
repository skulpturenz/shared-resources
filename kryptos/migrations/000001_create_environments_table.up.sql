CREATE TABLE IF NOT EXISTS environments (
	uuid TEXT NOT NULL,
	key TEXT NOT NULL,
	value TEXT NOT NULL,
	project TEXT NOT NULL,
	deprecated INTEGER NOT NULL
);