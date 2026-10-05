import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ p }) {
  const { addToCart } = useApp();

  const addProduct = () => {
    addToCart({
      type: 'product',
      cartItemId: `product-${p._id}`,
      productId: p._id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      quantity: 1,
    });
  };

  return (
    <article className="productCard">
      <Link to={`/product/${p._id}`}>
        <img src={p.image} alt={p.name} />
      </Link>

      <div className="productBody">
        <div className="eyebrow">{p.category}</div>

        <Link to={`/product/${p._id}`}>
          <h3>{p.name}</h3>
        </Link>

        <div className="rating">
          <Star size={14} fill="currentColor" />
          {p.rating}
        </div>

        <div className="priceRow">
          <strong>₹{p.price}</strong>

          <button
            type="button"
            onClick={addProduct}
            disabled={p.stock <= 0}
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
