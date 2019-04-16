CREATE TABLE characters (
    id serial primary key,
    name varchar(64) NOT NULL,
    maxhp integer default 0
);

CREATE TABLE battles (
    id serial primary key,
    name varchar(64)
);
        
CREATE TABLE battleentries (
    characterid integer NOT NULL REFERENCES characters(id),
    battleid integer NOT NULL REFERENCES battles(id),
    UNIQUE(characterid, battleid)
);