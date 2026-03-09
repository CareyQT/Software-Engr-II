const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Setup connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Sample Data from CS Catalog
const courses = [
  {
    code: 'CS 161',
    title: 'INTRODUCTION TO COMPUTER SCIENCE I',
    credits: 4,
    description:
      'Overview of fundamental concepts of computer science. Introduction to problem solving, software engineering, and object-oriented programming. Includes algorithm design and program development.',
  },
  {
    code: 'CS 162',
    title: 'INTRODUCTION TO COMPUTER SCIENCE II',
    credits: 4,
    description:
      'Provides an overview of the fundamental concepts of computer science. Studies basic computer programming techniques and application of software engineering principles.',
  },
  {
    code: 'CS 225',
    title: 'DISCRETE STRUCTURES IN COMPUTER SCIENCE',
    credits: 4,
    description:
      'An introduction to the discrete mathematics of computer science, including logic, set and set operations, methods of proof, recursive definitions, combinatorics, and graph theory.',
  },
  {
    code: 'CS 261',
    title: 'DATA STRUCTURES',
    credits: 4,
    description:
      'Abstract data types, dynamic arrays, linked lists, trees and graphs, binary search trees, hash tables, storage management, complexity analysis of data structures.',
  },
  {
    code: 'CS 290',
    title: 'WEB DEVELOPMENT',
    credits: 4,
    description: 'How to design and implement a multi-tier application using web technologies.',
  },
]

async function seed() {
  try {
    console.log('Starting data ingestion...')
    for (const course of courses) {
      await pool.query(
        'INSERT INTO Course (code, title, credits, description) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [course.code, course.title, course.credits, course.description]
      )
      console.log(`Inserted: ${course.code}`)
    }
    console.log('Successfully seeded curated CS core subset.')
  } catch (err) {
    console.error('Error seeding database:', err)
  } finally {
    await pool.end()
  }
}

seed()
