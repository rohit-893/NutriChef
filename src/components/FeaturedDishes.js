const FeaturedDishes = () => {
    const dishes = [
      { name: 'Dish 1', id: 1, image: '/path/to/image1.jpg' },
      { name: 'Dish 2', id: 2, image: '/path/to/image2.jpg' },
      { name: 'Dish 3', id: 3, image: '/path/to/image3.jpg' },
      { name: 'Dish 4', id: 4, image: '/path/to/image4.jpg' },
    ];
  
    return (
      <section className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dishes.map((dish) => (
            <div key={dish.id} className="bg-white p-4 rounded-lg shadow-md">
              <img src={dish.image} alt={dish.name} className="w-full h-40 object-cover rounded-lg" />
              <h3 className="mt-2">{dish.name}</h3>
              <a href={`/recipes/${dish.id}`} className="text-blue-500">Recipe Link</a>
            </div>
          ))}
        </div>
      </section>
     
    );
  };
  
  export default FeaturedDishes;
  