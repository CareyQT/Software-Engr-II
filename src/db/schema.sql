CREATE TABLE Course (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(8) NOT NULL UNIQUE,
    credits INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE Offering (
    course_id INTEGER REFERENCES Course(id),
    term VARCHAR(10),
    year INTEGER,
    campus VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Prerequisites (
    course_id INTEGER REFERENCES Course(id),
    rule_type VARCHAR(50),
    rule_json JSONB,
    raw_text TEXT
);