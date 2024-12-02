import Link from 'next/link';
import { FaHamburger } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white">
      <div className="text-2xl font-bold">NutriChef🍴</div>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="lg:hidden">
        <FaHamburger size={24} />
      </div>
    </nav>
  );
};

export default Navbar;
