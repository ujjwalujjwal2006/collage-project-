-- Seed default menu items (only inserted if table is empty)
INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Samosa', 15, 'Snacks', 'Crispy fried pastry with spiced potato filling.', 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Samosa');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Vada Pav', 20, 'Snacks', 'Mumbai-style spicy potato fritter in a bun.', 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Vada Pav');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Masala Dosa', 50, 'Meals', 'Thin crispy crepe with spiced potato filling.', 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Masala Dosa');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Paneer Wrap', 60, 'Meals', 'Grilled paneer with veggies wrapped in roti.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Paneer Wrap');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Cold Coffee', 40, 'Beverages', 'Chilled blended coffee with milk and ice cream.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cold Coffee');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Masala Chai', 15, 'Beverages', 'Traditional Indian spiced tea brewed to perfection.', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Masala Chai');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Veg Thali', 80, 'Meals', 'Complete meal with roti, rice, dal, sabzi, and salad.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Veg Thali');

INSERT INTO menu_items (name, price, category, description, image_url)
SELECT 'Gulab Jamun', 30, 'Desserts', 'Soft milk-solid dumplings soaked in rose syrup.', 'https://images.unsplash.com/photo-1666190073498-0fe0946e9dea?w=400&h=300&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Gulab Jamun');
