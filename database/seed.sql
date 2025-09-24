-- Seed data for BrowGen
INSERT INTO categories (slug, name) VALUES
  ('tech','Tech'),
  ('soft-skills','Soft Skills'),
  ('entrepreneurship','Entrepreneurship'),
  ('creative','Creative')
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, category_id, level)
SELECT 'Intro to Web Dev','Learn HTML, CSS, JS basics', id, 'beginner' FROM categories WHERE slug='tech'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, category_id, level)
SELECT 'Public Speaking Basics','Boost your confidence and clarity', id, 'beginner' FROM categories WHERE slug='soft-skills'
ON CONFLICT DO NOTHING;

-- Create a couple of modules for first course
WITH c AS (
  SELECT id FROM courses WHERE title='Intro to Web Dev' LIMIT 1
)
INSERT INTO modules (course_id, title, content, order_index)
SELECT c.id, 'HTML Fundamentals', 'Tags, structure, semantics', 1 FROM c
UNION ALL
SELECT c.id, 'CSS Basics', 'Selectors, box model, layout', 2 FROM c
UNION ALL
SELECT c.id, 'JavaScript Intro', 'Variables, functions, DOM', 3 FROM c;

-- Mentors
INSERT INTO mentors (name, bio, expertise, available) VALUES
  ('Aarav Mehta', 'Full-stack engineer and mentor', ARRAY['web','js','career'], true),
  ('Sara Khan', 'Communication coach', ARRAY['public speaking','soft skills'], true)
ON CONFLICT DO NOTHING;

-- Blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, category) VALUES
  ('Getting Started with Coding', 'getting-started-coding', 'Kickstart your journey', 'Long form content here...', 'Tech'),
  ('Ace Your First Interview', 'ace-first-interview', 'Practical tips for success', 'Long form content here...', 'Soft Skills')
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO testimonials (user_name, content, role) VALUES
  ('Rohan', 'BrowGen helped me build confidence and land my first internship!', 'Student'),
  ('Neha', 'The community and mentors are amazing.', 'Graduate');

-- Events
INSERT INTO events (title, description, event_date, link) VALUES
  ('Monthly Tech Webinar', 'Live session on modern web dev', NOW() + INTERVAL '7 days', 'https://example.com/event1'),
  ('Career Q&A', 'Ask mentors anything about career growth', NOW() + INTERVAL '14 days', 'https://example.com/event2');
