import React from 'react';
import { Link } from 'react-router-dom';
import './Journal.css';

const JOURNAL_POSTS = [
  {
    id: 1,
    title: "Heavyweight Cotton & Craftsmanship Guide",
    date: "August 20, 2026",
    excerpt: "Why 280GSM+ organic cotton makes the ultimate silhouette for drakewears oversized drop shoulder tees.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "How to Style Baggy Trousers in 2026",
    date: "August 14, 2026",
    excerpt: "Mastering proportions: Pairing wide-leg baggy trousers with chunky footwear and boxy silhouettes.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Behind the Brand: The drakewears Story",
    date: "August 05, 2026",
    excerpt: "Redefining urban streetwear culture through minimal aesthetics, premium textures, and contemporary fits.",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=1200&auto=format&fit=crop"
  }
];

const Journal = () => {
  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="journal-header">
            <h1 className="h1">Journal</h1>
          </div>

          <div className="journal-grid">
            {JOURNAL_POSTS.map(post => (
              <article key={post.id} className="journal-card animate-slide-up">
                <Link to={`/journal/${post.id}`} className="journal-image img-hover-wrapper">
                  <img src={post.image} alt={post.title} />
                </Link>
                <div className="journal-content">
                  <span className="journal-date text-caption">{post.date}</span>
                  <Link to={`/journal/${post.id}`}><h2 className="journal-title h3">{post.title}</h2></Link>
                  <p className="journal-excerpt text-body">{post.excerpt}</p>
                  <Link to={`/journal/${post.id}`} className="btn-outline" style={{ padding: '10px 20px', marginTop: '16px' }}>Read More</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;
