import React from "react";

export default function KitchenSinkPage() {
  const colorGroups = [
    {
      name: "Neutral Colors",
      colors: [
        { name: "neutral-white", class: "bg-neutral-white" },
        { name: "neutral-lightest", class: "bg-neutral-lightest" },
        { name: "neutral-light", class: "bg-neutral-light" },
        { name: "neutral-medium", class: "bg-neutral-medium text-white" },
        { name: "neutral-darker", class: "bg-neutral-darker text-white" },
        { name: "neutral-black", class: "bg-neutral-black text-white" },
      ],
    },
    {
      name: "Primary Brand Colors",
      colors: [
        { name: "primary-lightest", class: "bg-primary-lightest" },
        { name: "primary-light", class: "bg-primary-light" },
        { name: "primary-medium", class: "bg-primary-medium text-white" },
        { name: "primary-dark", class: "bg-primary-dark text-white" },
      ],
    },
    {
      name: "Secondary Brand Colors",
      colors: [{ name: "secondary-danger", class: "bg-secondary-danger text-white" }],
    },
    {
      name: "Category Background Colors",
      colors: [
        { name: "categories-preparedMeals-bg", class: "bg-categories-preparedMeals-bg" },
        { name: "categories-clothes-bg", class: "bg-categories-clothes-bg" },
        { name: "categories-fruits-bg", class: "bg-categories-fruits-bg" },
        { name: "categories-vegetables-bg", class: "bg-categories-vegetables-bg" },
        { name: "categories-craftsmanship-bg", class: "bg-categories-craftsmanship-bg" },
        { name: "categories-bakery-bg", class: "bg-categories-bakery-bg" },
        { name: "categories-coffeeShop-bg", class: "bg-categories-coffeeShop-bg text-white" },
        { name: "categories-selfcare-bg", class: "bg-categories-selfcare-bg text-white" },
        { name: "categories-alcohol-bg", class: "bg-categories-alcohol-bg text-white" },
      ],
    },
    {
      name: "Category Text Colors",
      colors: [
        {
          name: "categories-preparedMeals-text",
          class: "bg-categories-preparedMeals-text text-white",
        },
        { name: "categories-clothes-text", class: "bg-categories-clothes-text text-white" },
        { name: "categories-fruits-text", class: "bg-categories-fruits-text text-white" },
        { name: "categories-vegetables-text", class: "bg-categories-vegetables-text text-white" },
        {
          name: "categories-craftsmanship-text",
          class: "bg-categories-craftsmanship-text text-white",
        },
        { name: "categories-bakery-text", class: "bg-categories-bakery-text text-white" },
        { name: "categories-coffeeShop-text", class: "bg-categories-coffeeShop-text" },
        { name: "categories-selfcare-text", class: "bg-categories-selfcare-text" },
        { name: "categories-alcohol-text", class: "bg-categories-alcohol-text" },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tailwind Color Palette</h1>
      </div>

      <div className="space-y-12">
        {colorGroups.map((group) => (
          <section key={group.name} className="space-y-4">
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.colors.map((color) => (
                <div key={color.name} className={`p-6 ${color.class}`}>
                  <div className="flex flex-col h-full justify-between">
                    <div className="h-12"></div>
                    <div>
                      <p className="font-mono text-sm">{color.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
