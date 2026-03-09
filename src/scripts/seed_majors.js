const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const majors = [
  { name: 'Computer Science', department: 'EECS' },
  { name: 'Electrical and Computer Engineering', department: 'EECS' },
  { name: 'Mechanical Engineering', department: 'MIME' },
  { name: 'Business Administration', department: 'College of Business' },
  { name: 'Physics', department: 'College of Science' },
]

async function seedMajors() {
  try {
    console.log('Seeding OSU Majors...')
    for (const major of majors) {
      await pool.query(
        'INSERT INTO Major (name, department) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [major.name, major.department]
      )
    }
    console.log('Majors seeded successfully.')
  } catch (err) {
    console.error('Error seeding majors:', err)
  } finally {
    await pool.end()
  }
}

seedMajors()
