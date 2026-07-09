import React from "react";
import Hero from "../../components/hero/Hero";
import Homeintro from "../../components/homeIntro/Homeintro";
import Youtubeintro from "../../components/youtubeIntro/YoutubeIntro";
import Homeservices from "../../components/homeservices/Homeservices";
import DevelopingEstate from "../../components/developingestate/DevelopingEstate";
import Whychoose from "../../components/whychoose/Whychoose";
import Earnhome from "../../components/earnhome/Earnhome";
import Homeallocate from "../../components/homeallocate/Homeallocate";
import Reviews from "../../components/reviews/Reviews";

function Home() {
  return (
    <main className="section w-full overflow-x-hidden">
      <Hero />
      <Homeintro />
      <Youtubeintro />
      <Homeservices />
      <DevelopingEstate />
      <Whychoose />
      <Earnhome />
      <Homeallocate />
      <Reviews />
    </main>
  );
}

export default Home;
