import { useNavigate } from 'react-router-dom';
import './index.scss';
import blitzProcurementImg from '../../assets/images/blitzprocurement.webp';
import superStudioImg from '../../assets/images/SuperStudio.webp';
import whiskyBakingCardImg from '../../assets/images/whisky_baking_card.webp';
import familiarPathsImg from '../../assets/images/familar_paths.webp';
import itonImg from '../../assets/images/Itọñ.webp';
import afronautsImg from '../../assets/images/afronauts_crumbs.webp';

const Portfolio = ({ embedded = false }) => {
  const navigate = useNavigate();

  return (
    <div className={`portfolio-scroll-container${embedded ? ' portfolio-scroll-container--embedded' : ''}`}>
      <section className="portfolio-buttons-container" aria-label="Portfolio projects">
        <button
          type="button"
          className="portfolio-card portfolio-card--coding"
          aria-label="Explore Coding Projects"
          onClick={() => navigate('/coding-projects')}
        >
          <span className="portfolio-card__index" aria-hidden="true"><span>01</span><i /></span>
          <span className="portfolio-card__title">Coding Projects</span>
          <span className="portfolio-card__eyebrow">WEB APPLICATIONS&nbsp; / &nbsp;TOOLS&nbsp; / &nbsp;INTERFACES</span>
          <span className="portfolio-card__coding-collage" aria-hidden="true">
            <span className="portfolio-card__code-frame portfolio-card__code-frame--studio">
              <img src={superStudioImg} alt="" />
            </span>
            <span className="portfolio-card__code-frame portfolio-card__code-frame--blitz">
              <img src={blitzProcurementImg} alt="" />
            </span>
            <span className="portfolio-card__code-frame portfolio-card__code-frame--whisky">
              <img src={whiskyBakingCardImg} alt="" />
            </span>
          </span>
          <span className="portfolio-card__action"><span className="portfolio-card__arrow" aria-hidden="true">⟶</span>Explore projects</span>
        </button>

        <button
          type="button"
          className="portfolio-card portfolio-card--film"
          aria-label="Enter the Nonsense and Ingredients film archive"
          onClick={() => navigate('/film-projects')}
        >
          <span className="portfolio-card__index" aria-hidden="true"><span>02</span><i /></span>
          <span className="portfolio-card__film-heading">
            <span className="portfolio-card__title">Nonsense <span>&amp;</span><br />Ingredients</span>
            <span className="portfolio-card__eyebrow">SHORT FILMS&nbsp; / &nbsp;ACADEMIC ESSAYS&nbsp; / &nbsp;FILM REVIEWS&nbsp; / &nbsp;MEDIA DIARY</span>
          </span>
          <span className="portfolio-card__collage" aria-hidden="true">
            <span className="portfolio-card__tagline">A collection of films and ideas</span>
            <span className="portfolio-card__film-frame portfolio-card__film-frame--portrait">
              <img src={itonImg} alt="" />
            </span>
            <span className="portfolio-card__film-frame portfolio-card__film-frame--paths">
              <img src={familiarPathsImg} alt="" />
            </span>
            <span className="portfolio-card__film-frame portfolio-card__film-frame--poster">
              <img src={afronautsImg} alt="" />
            </span>
            <span className="portfolio-card__film-grain" />
          </span>
          <span className="portfolio-card__action"><span className="portfolio-card__arrow" aria-hidden="true">⟶</span>Enter the archive</span>
        </button>
      </section>
    </div>
  );
};

export default Portfolio;
