import './index.scss';
import codingImg from '../../assets/images/coding.png';
import filmImg from '../../assets/images/film.jpg';

const Portfolio = () => {
  return (
    <div className="portfolio-scroll-container">
      <div className="portfolio-buttons-container">
        <div className="portfolio-button-group">
          <div className="portfolio-button-title">Coding Projects</div>
          <button className="portfolio-big-button coding-button" aria-label="Coding Projects">
            <img src={codingImg} alt="Coding" className="portfolio-button-img" />
          </button>
        </div>
        <div className="portfolio-button-group">
          <div className="portfolio-button-title">Film Projects</div>
          <button className="portfolio-big-button film-button" aria-label="Film Projects">
            <img src={filmImg} alt="Film" className="portfolio-button-img" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;