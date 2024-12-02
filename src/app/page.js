import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import IngredientSearch from '../components/IngredientSearch';
import FeaturedDishes from '../components/FeaturedDishes';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <IngredientSearch />
      <FeaturedDishes />
      <Footer />
    </div>
  );
}
