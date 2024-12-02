'use client';

const Hero = () => {
  const handleScrollToSearch = () => {
    const element = document.getElementById("ingredient-search");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
        <div>
          <h1 className="text-4xl font-bold">Cooking, Made Easy with What You Have</h1>
          <button
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-full"
            onClick={handleScrollToSearch}
          >
            Start Cooking
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
