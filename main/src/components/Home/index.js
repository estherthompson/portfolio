import './index.scss';
import ProfileImage from '../../assets/images/profile.jpeg';
import Background_1 from '../../assets/images/background_1.png';
import Image_8 from '../../assets/images/8.png';
import Image_9 from '../../assets/images/9.png';

const Home = () => {
    return (
        <>
            <div className="star-container">
                <img src={Image_8} alt="Image_8" />
            </div>
            <div className="image-9-container">
                <img src={Image_9} alt="Image_9" />
            </div>
            <div className="home-page">
                <div className="background-zone">
                    <img src={Background_1} alt="Background_1" width="100" height="100" />
                    <div className="text-zone">
                        <div className='typewriter-wrapper'>
                            <h1>&lt;Hello World!&gt;</h1>
                            <h2>I'm Esther Thompson</h2>
                            <h3>Senior Computer Science </h3>
                            <h4> & Film Studies Student!</h4>
                        </div>
                    </div>
                </div>
                <div className="image-container">
                    <img src={ProfileImage} alt="Profile" width="252" height="336" />
                </div>
            </div>
        </>
    );
}

export default Home;
