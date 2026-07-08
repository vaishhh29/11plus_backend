const { execSync } = require('child_process');

console.log("Starting bulk English Reading Comprehension Seeding (200 questions total)...");

try {
  console.log("Running Part 1 (Passages 1-5)...");
  execSync('node generate_alternate_english_part1.js', { stdio: 'inherit' });

  console.log("Running Part 2 (Passages 6-10)...");
  execSync('node generate_alternate_english_part2.js', { stdio: 'inherit' });

  console.log("Running Part 3 (Passages 11-15)...");
  execSync('node generate_alternate_english_part3.js', { stdio: 'inherit' });

  console.log("Running Part 4 (Passages 16-20)...");
  execSync('node generate_alternate_english_part4.js', { stdio: 'inherit' });

  console.log("All parts completed successfully! 200 Alternate English Reading Comprehension questions added.");
} catch (error) {
  console.error("Error executing parts:", error);
}
