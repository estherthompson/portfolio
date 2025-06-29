import React, { useRef, useEffect, useState } from 'react';
import './PhotoCarousel.scss';
import img10 from '../../assets/images/10.png';
import img11 from '../../assets/images/11.png';
import img12 from '../../assets/images/12.png';
import img13 from '../../assets/images/13.png';
import img14 from '../../assets/images/14.png';

const images = [img10, img11, img12, img13, img14];

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

  const handleNavClick = (idx) => {
    setCurrent(idx);
  };

  return (
    <section className="carousel-container">
      <div className="slider-wrapper">
        <div className="slider" ref={sliderRef}>
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`Slide ${idx + 1}`} />
          ))}
        </div>
        <div className="slider-nav">
          {images.map((_, idx) => (
            <a
              key={idx}
              href="#"
              onClick={e => { e.preventDefault(); handleNavClick(idx); }}
              style={{ opacity: current === idx ? 1 : 0.75 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoCarousel; 