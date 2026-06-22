import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(product);
  };


  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop" 
            alt="Cyberpunk streetwear aesthetic" 
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-drop-tag">Drop 004 Is Live</span>
            <h1>Wear<br />Your<br />Culture</h1>
            <p>Unapologetic graphic tees for the youth. Anime, pop culture, and raw streetwear energy. Not for the faint of heart.</p>
            <Link to="/shop" className="btn btn-primary hero-btn">Explore Catalog</Link>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Choose Your Fighter</h2>
          <div className="fighter-grid">
            <Link to="/shop?category=Anime" className="fighter-card main-fighter">
              <img 
                src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop" 
                alt="Mecha Anime" 
                className="fighter-bg" 
              />
              <h3 className="fighter-title">Anime<br />Core</h3>
            </Link>

            <Link to="/shop?category=Graphic" className="fighter-card">
              <img 
                src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop" 
                alt="Y2K Graphic" 
                className="fighter-bg" 
              />
              <h3 className="fighter-title">Y2K<br />Graphic</h3>
            </Link>

            <Link to="/shop?category=Limited" className="fighter-card">
              <img 
                src="https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=800&auto=format&fit=crop" 
                alt="Pop Culture" 
                className="fighter-bg" 
              />
              <h3 className="fighter-title">Pop<br />Culture</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Gear Rotation */}
      <section className="gear-section">
        <div className="container">
          <div className="gear-header">
            <h2 className="section-title">Gear Rotation</h2>
            <p>New footwear and accessories just landed. Built to stack with the rest of the drop instead of feeling like filler.</p>
          </div>
          <div className="gear-grid">
            <Link to="/shop?category=Footwear" className="gear-card">
              <img 
                src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop" 
                alt="Footwear rotation" 
              />
              <div className="gear-card-copy">
                <span className="gear-kicker">Footwear</span>
                <h3>Heavy soles, city mileage, zero soft energy.</h3>
                <p>Fresh runners, high-tops, and tactical pairs for brutal daily wear.</p>
              </div>
            </Link>
            <Link to="/shop?category=Accessories" className="gear-card">
              <img 
                src="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop" 
                alt="Accessories rotation" 
              />
              <div className="gear-card-copy">
                <span className="gear-kicker">Accessories</span>
                <h3>Utility pieces for the fit, not afterthought add-ons.</h3>
                <p>Crossbodies, caps, chains, and belts to sharpen the whole silhouette.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Drops Section */}
      <section className="drops-section">
        <div className="container">
          <h2 className="section-title">Latest Drops</h2>
          {loading ? (
            <div className="empty-state">
              <p>LOADING INVENTORY...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products in stock.</p>
            </div>
          ) : (
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <article key={product._id} className="product-card">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-image" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="product-info">
                    <div className="product-category">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price">Rs {Number(product.price).toLocaleString('en-IN')}</div>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto-section">
        <div className="container">
          <h2 className="manifesto-title">Not Another<br />F*cking Brand.</h2>
          <div className="manifesto-grid">
            <div>
              Mangrove started in a cramped bedroom at 3 AM on a Discord call. We were tired of basic mall brands co-opting our culture and slapping a generic logo on a thin tee. We grew up on Toonami, spent our teens making memes, and live on the internet. Our clothes reflect that chaos.
            </div>
            <div>
              Every design is printed on heavyweight, premium cotton. No fast fashion bullshit. We drop when we have something to say.<br /><br />
              IF YOU GET IT, YOU GET IT.
            </div>
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="community-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Worn By The Culture</h2>
          <div className="cult-grid">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop" alt="Community 1" className="cult-img" />
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop" alt="Community 2" className="cult-img" />
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" alt="Community 3" className="cult-img" />
            <img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop" alt="Community 4" className="cult-img" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
