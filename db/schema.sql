CREATE TABLE characters (
    characterid serial primary key,
    owner integer NOT NULL REFERENCES users(userid),
    name varchar(64) NOT NULL,
    temp boolean default true,
    maxhp integer,
    currenthp integer
);

CREATE TABLE battles (
    battleid serial primary key,
    owner integer NOT NULL REFERENCES users(userid),
    name varchar(64),
    next integer REFERENCES characters(characterid)
);

CREATE TABLE battleentries (
    characterid integer NOT NULL REFERENCES characters(characterid) ON DELETE CASCADE,
    battleid integer NOT NULL REFERENCES battles(battleid) ON DELETE CASCADE,
    initative integer,
    effect varchar(64),
    UNIQUE(characterid, battleid)
);

CREATE TABLE user (
    id serial primary key,
    username varchar(64),
    password varchar(64),
    UNIQUE(username)
),