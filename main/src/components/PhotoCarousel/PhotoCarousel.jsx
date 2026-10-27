import React, { useRef, useEffect, useState } from 'react';
import './PhotoCarousel.scss';
import carousel_1 from '../../assets/images/carousel_1.webp';
import carousel_2 from '../../assets/images/carousel_2.webp';
import carousel_3 from '../../assets/images/carousel_3.webp';
import carousel_4 from '../../assets/images/carousel_4.webp';
import carousel_5 from '../../assets/images/carousel_5.webp';
import carousel_6 from '../../assets/images/carousel_6.webp';
import carousel_7 from '../../assets/images/carousel_7.webp';
import carousel_8 from '../../assets/images/carousel_8.webp';
import carousel_9 from '../../assets/images/carousel_9.webp';
import carousel_10 from '../../assets/images/carousel_10.webp';
import carousel_11 from '../../assets/images/carousel_11.webp';
import carousel_13 from '../../assets/images/carousel_13.webp';
import carousel_14 from '../../assets/images/carousel_14.webp';
import carousel_15 from '../../assets/images/carousel_15.webp';
import carousel_16 from '../../assets/images/carousel_16.webp';
import carousel_17 from '../../assets/images/carousel_17.webp';
import carousel_18 from '../../assets/images/carousel_18.webp';
import carousel_19 from '../../assets/images/carousel_19.webp';
import carousel_20 from '../../assets/images/carousel_20.webp';
import carousel_21 from '../../assets/images/carousel_21.webp';
import carousel_22 from '../../assets/images/carousel_22.webp';
import carousel_23 from '../../assets/images/carousel_23.webp';
import carousel_24 from '../../assets/images/carousel_24.webp';
import carousel_25 from '../../assets/images/carousel_25.webp';
import carousel_26 from '../../assets/images/carousel_26.webp';
import carousel_27 from '../../assets/images/carousel_27.webp';
import carousel_28 from '../../assets/images/carousel_28.webp';
import carousel_29 from '../../assets/images/carousel_29.webp';
import carousel_30 from '../../assets/images/carousel_30.webp';
import carousel_31 from '../../assets/images/carousel_31.webp';
import carousel_32 from '../../assets/images/carousel_32.webp';
import carousel_34 from '../../assets/images/carousel_34.webp';
import carousel_35 from '../../assets/images/carousel_35.webp';
import carousel_36 from '../../assets/images/carousel_36.webp';
import carousel_37 from '../../assets/images/carousel_37.webp';
import carousel_38 from '../../assets/images/carousel_38.webp';
import carousel_39 from '../../assets/images/carousel_39.webp';
import carousel_40 from '../../assets/images/carousel_40.webp';
import carousel_41 from '../../assets/images/carousel_41.webp';
import carousel_42 from '../../assets/images/carousel_42.webp';
import carousel_43 from '../../assets/images/carousel_43.webp';
import carousel_44 from '../../assets/images/carousel_44.webp';
import carousel_45 from '../../assets/images/carousel_45.webp';
import carousel_46 from '../../assets/images/carousel_46.webp';
import carousel_47 from '../../assets/images/carousel_47.webp';
import carousel_48 from '../../assets/images/carousel_48.webp';
import carousel_49 from '../../assets/images/carousel_49.webp';
import carousel_51 from '../../assets/images/carousel_51.webp';


const images = [carousel_1, carousel_2, carousel_3, carousel_4, carousel_5, carousel_6, carousel_7, carousel_8,

                carousel_9, carousel_10, carousel_11, carousel_13, carousel_14, carousel_15, carousel_16,
                carousel_17, carousel_18, carousel_19, carousel_20, carousel_21, carousel_22, carousel_23, carousel_24,
                carousel_25, carousel_26, carousel_27, carousel_28, carousel_29, carousel_30, carousel_31, carousel_32,
                carousel_34, carousel_35, carousel_36, carousel_37, carousel_38, carousel_39, carousel_40,
                carousel_41, carousel_42, carousel_43, carousel_44, carousel_45, carousel_46, carousel_47, carousel_48,
                carousel_49, carousel_51
];

const PhotoCarousel = () => {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.offsetWidth * current,
        behavior: 'smooth',
      });
    }
  }, [current]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="carousel-container">
      <div className="slider-wrapper">
        <button className="carousel-arrow left-arrow" onClick={handlePrev} aria-label="Previous slide">&#8592;</button>
        <div className="slider" ref={sliderRef}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Slide ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}
        </div>
        <button className="carousel-arrow right-arrow" onClick={handleNext} aria-label="Next slide">&#8594;</button>
      </div>
    </section>
  );
};

export default PhotoCarousel; 