import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const location = useLocation();

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync selected category from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    setSelectedCategory(cat);
  }, [location]);

  // Apply filtering whenever category or products changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase()));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product);
  };


  return (
    <div className="shop-page container animate-fade-in" style={{ padding: '3rem 2rem' }}>
      <header className="shop-header" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: '1rem' }}>ALL DROPS</h1>
        <p style={{ maxWidth: '600px', color: 'var(--text-muted)' }}>
          Every piece we've dropped. The latest rotation features heavy GSM apparel, industrial gear, and tactical accessories.
        </p>
      </header>

      <div className="shop-controls" style={{ marginBottom: '3rem' }}>
        <select 
          value={selectedCategory} 
          onChange={handleCategoryChange}
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            border: '2px solid var(--border-color)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">ALL DROPS</option>
          <option value="Anime">ANIME CORE</option>
          <option value="Graphic">Y2K GRAPHIC</option>
          <option value="Limited">POP CULTURE</option>
          <option value="Footwear">FOOTWEAR</option>
          <option value="Accessories">ACCESSORIES</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>RETRIEVING DROP INVENTORY...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products found in this category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-image" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
                }}
              />
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
                <div className="product-stock">Available Units: {product.stock}</div>
                <div className="product-actions" style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
