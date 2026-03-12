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

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    onid VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Major (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Student_Majors (
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    major_id INTEGER REFERENCES Major(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, major_id)
);

CREATE TABLE IF NOT EXISTS Plan (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    owner_key VARCHAR(255),
    plan_name VARCHAR(100) DEFAULT 'My Academic Plan',
    term_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_grades JSONB NOT NULL DEFAULT '{}'::jsonb,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_owner_key ON Plan(owner_key);

CREATE TABLE IF NOT EXISTS Plan_Entry (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES Plan(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES Course(id),
    term VARCHAR(20) NOT NULL,
    academic_year INTEGER NOT NULL,
    UNIQUE(plan_id, course_id)
);
