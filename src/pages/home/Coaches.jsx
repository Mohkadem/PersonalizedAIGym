import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CardCarousel from "./CardCarousel";
import { publicAPI } from "../../services/api";
// import Title from "./Title";

// 👉 Local arbitrary coaches (static data)
const COACHES = [
  {
    id: 1,
    Trainer_Name: "Alex Steel",
    speciality: "Strength & Powerlifting",
  },
  {
    id: 2,
    Trainer_Name: "Maria Blaze",
    speciality: "HIIT & Fat Loss",
  },
  {
    id: 3,
    Trainer_Name: "Jordan Flex",
    speciality: "Bodybuilding & Hypertrophy",
  },
  {
    id: 4,
    Trainer_Name: "Sofia Core",
    speciality: "Core Training & Mobility",
  },
  {
    id: 5,
    Trainer_Name: "Leo Titan",
    speciality: "Functional Training",
  },
];

const Coaches = () => {
  const [search, setSearch] = useState("");
  const [coaches, setCoaches] = useState(COACHES); // fallback to static
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await publicAPI.getCoaches();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          // Backend already returns same shape as COACHES: { id, Trainer_Name, speciality }
          setCoaches(response.data);
        }
      } catch (err) {
        console.error("Error loading coaches:", err);
        // keep the static COACHES fallback
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  // Filter based on search
  const filteredCoaches = coaches.filter((trainer) =>
    trainer.Trainer_Name.toLowerCase().includes(search.toLowerCase())
  );

  // Convert to card format required by CardCarousel
  const cards = filteredCoaches.map((trainer) => ({
    title: trainer.Trainer_Name,
    description: `Speciality: ${trainer.speciality}`,
  }));

  const noResults = !loading && search && filteredCoaches.length === 0;

  return (
    <section className="w-full flex flex-col overflow-x-hidden" id="coaches">
      <div className="h-[15vh] sm:h-[18vh] md:h-[20vh] w-full">
        {/* <Title title="Coaches & Prizes" /> */}
        {/* <SearchBar
          placeholder="Enter trainer name"
          value={search}
          onChange={setSearch}
        /> */}
      </div>

      <div className="min-h-[85vh] sm:min-h-[82vh] md:h-[80vh] flex-center items-center w-full px-4 sm:px-6 md:px-8">
        {cards.length > 0 && <CardCarousel cards={cards} />}

        {noResults && (
          <p className="text-white text-base sm:text-lg font-semibold text-center px-4">
            Sorry, no Coaches found for "{search}".
          </p>
        )}
      </div>
    </section>
  );
};

export default Coaches;
