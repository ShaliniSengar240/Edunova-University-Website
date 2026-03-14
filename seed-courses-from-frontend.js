const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(str) {
  return decodeHtml(str.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function inferType(title) {
  const t = title.toLowerCase();
  if (t.startsWith('bachelor')) return 'Bachelor';
  if (t.startsWith("master")) return 'Master';
  if (t.startsWith('diploma')) return 'Diploma';
  if (t.startsWith('certificate')) return 'Certificate';
  // fallback: pick Bachelor/Master based on common words
  if (t.includes('master')) return 'Master';
  return 'Bachelor';
}

function parseDuration(durationLine) {
  // Examples: "4 Years | Full-time"
  const m = durationLine.match(/(\d+)\s*Year[s]?/i);
  if (m) return `${m[1]} Years`;
  return durationLine.trim().slice(0, 50) || 'N/A';
}

function extractCoursesFromHtml(html) {
  // Split including attributes on program-card (e.g. data-fee="...")
  const cards = html.split('<div class="program-card"').slice(1);
  const courses = [];

  for (const card of cards) {
    const openTagPart = card.split('>')[0] || '';
    const feeAttrMatch = openTagPart.match(/data-fee\s*=\s*"(\d+(?:\.\d+)?)"/i);
    const fee = feeAttrMatch ? Number(feeAttrMatch[1]) : null;

    const titleMatch = card.match(/<h3>([\s\S]*?)<\/h3>/i);
    const durationMatch = card.match(/<p class="duration">([\s\S]*?)<\/p>/i);
    const descMatch = card.match(/<p class="description">([\s\S]*?)<\/p>/i);

    const name = titleMatch ? stripTags(titleMatch[1]) : null;
    const durationRaw = durationMatch ? stripTags(durationMatch[1]) : '';
    const duration = parseDuration(durationRaw);
    const description = descMatch ? stripTags(descMatch[1]) : null;

    if (!name) continue;
    const type = inferType(name);

    courses.push({
      name,
      type,
      duration,
      description,
      fee: Number.isFinite(fee) ? fee : null,
    });
  }

  // De-dupe by name (just in case)
  const seen = new Set();
  return courses.filter((c) => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const htmlPath = path.join(__dirname, '..', 'frontend', 'courses.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const courses = extractCoursesFromHtml(html);

if (courses.length === 0) {
  console.error('No courses found in frontend/courses.html. Check markup for .program-card blocks.');
  process.exit(1);
}

console.log(`Found ${courses.length} courses in courses.html`);

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edunova_university',
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }

  console.log('Connected to MySQL database');
  console.log('Replacing courses table with courses from courses.html...');

  // Clear table first (applications.course_id is ON DELETE CASCADE)
  connection.query('DELETE FROM courses; ALTER TABLE courses AUTO_INCREMENT = 1;', (err) => {
    if (err) {
      console.error('Error clearing courses:', err);
      connection.end();
      process.exit(1);
    }

    const sql = 'INSERT INTO courses (name, type, duration, description, fee) VALUES ?';
    const values = courses.map((c) => [c.name, c.type, c.duration, c.description, c.fee]);

    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting courses:', err);
        connection.end();
        process.exit(1);
      }

      console.log(`✓ Inserted ${result.affectedRows} courses`);
      connection.end();
      console.log('Done.');
    });
  });
});

