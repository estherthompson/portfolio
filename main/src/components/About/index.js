import './index.scss'; // Import the corresponding stylesheet for styling
import Image10 from '../../assets/images/10.png';
import Image11 from '../../assets/images/11.png';
import Image12 from '../../assets/images/12.png';
import Image13 from '../../assets/images/13.png';
import Image14 from '../../assets/images/14.png';
import ProfileImg from '../../assets/images/IMG_2209.jpg';
import PhotoCarousel from '../PhotoCarousel/PhotoCarousel';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-content-wrapper">
        <div className="about-card-bg-wrapper">
          <img src={Image10} alt="Background 1" className="about-bg-image about-bg-image-1" />
          <img src={Image11} alt="Background 2" className="about-bg-image about-bg-image-2" />
          <img src={Image12} alt="Background 3" className="about-bg-image about-bg-image-3" />
          <img src={Image13} alt="Background 4" className="about-bg-image about-bg-image-4" />
          <img src={Image14} alt="Background 5" className="about-bg-image about-bg-image-5" />
          <div className="about-card about-card-flex">
            <div className="about-card-content">
              <h1 className="about-header">Hi there!</h1>
              <div className="about-text-box">
              <p> My name is <b>Esther Thompson</b>. I'm a Computer Science and Film Studies student at the University of Calgary, where I've been studying since 2022. My journey in technology began with software development, and I’ve since grown a strong interest in human-computer interaction, computer graphics, and cybersecurity. I’m passionate about creating impactful projects, solving complex problems, and building innovative solutions that celebrate the human experience.<br/> I look forward to connecting and collaborating with others to harness technology for meaningful impact. </p>
              </div>
            </div>
            <img src={ProfileImg} alt="Esther Thompson" className="about-profile-img-rect" />
          </div>
        </div>
        <div className="about-hobbies-section">
          <h2 className="hobbies-title">A Jack of All Trades (and Mastering Many!)</h2>
          <div className="hobbies-description">
            Every summer, I dive into a new hobby or interest and dedicate months to mastering it before moving on to the next great thing. I consider myself a jack of all trades and an aspiring master of all. My interests outside of tech are always evolving, and I love the challenge of learning something new—whether it's painting, photography, hiking, cooking, or anything else that sparks my curiosity!
          </div>
          <PhotoCarousel />
        </div>
      </div>
    </div>
  );
};

export default About;
