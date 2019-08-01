CREATE TABLE characters (
    characterid serial primary key,
    name varchar(64) NOT NULL,
    temp boolean default true,
    maxhp integer
);

CREATE TABLE battles (
    battleid serial primary key,
    name varchar(64)
);
        
CREATE TABLE battleentries (
    characterid integer NOT NULL REFERENCES characters(characterid) ON DELETE CASCADE,
    battleid integer NOT NULL REFERENCES battles(battleid) ON DELETE CASCADE,
    UNIQUE(characterid, battleid)
);

CREATE TABLE users (
    email varchar(64) primary key,
    hash varchar(128) NOT NULL,
    salt varchar(64) NOT NULL,
    username varchar(64),
    id varchar(64)
);