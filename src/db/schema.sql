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

-- 1. Users table (Stores basic profile)
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    onid VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Majors table
CREATE TABLE IF NOT EXISTS Major (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100)
);

-- 3. Student_Majors (Linking table for multi-major)
CREATE TABLE IF NOT EXISTS Student_Majors (
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    major_id INTEGER REFERENCES Major(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, major_id)
);

-- 4. Plan table
CREATE TABLE IF NOT EXISTS Plan (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) DEFAULT 'My Academic Plan',
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Plan_Entry (The individual courses inside a plan)
CREATE TABLE IF NOT EXISTS Plan_Entry (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES Plan(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES Course(id),
    term VARCHAR(20) NOT NULL, -- 'Fall', 'Winter', 'Spring', 'Summer'
    academic_year INTEGER NOT NULL, -- 2026
    UNIQUE(plan_id, course_id) -- Prevents adding the same course twice to one plan
);
