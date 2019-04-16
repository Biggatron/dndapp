CREATE TABLE characters (
    characterid serial primary key,
    name varchar(64) NOT NULL,
    temp boolean defult false,
    maxhp integer default 0
);

CREATE TABLE battles (
    battleid serial primary key,
    name varchar(64)
);
        
CREATE TABLE battleentries (
    characterid integer NOT NULL REFERENCES characters(characterid),
    battleid integer NOT NULL REFERENCES battles(battleid),
    UNIQUE(characterid, battleid)
);