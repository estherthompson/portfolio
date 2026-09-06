import reactIcon from '../../assets/Icons/react-original.svg';
import javascriptIcon from '../../assets/Icons/javascript-original.svg';
import pythonIcon from '../../assets/Icons/python-original.svg';
import gitIcon from '../../assets/Icons/git-original.svg';
import javaIcon from '../../assets/Icons/java-original.svg';
import arduinoIcon from '../../assets/Icons/arduino-original.svg';
import sqlDeveloperIcon from '../../assets/Icons/sqldeveloper-original.svg';
import cplusplusIcon from '../../assets/Icons/cplusplus.svg';
import nextIcon from '../../assets/Icons/next.svg';

export const techStack = [
  {
    name: 'React',
    color: '#1a1400',
    icon: <img src={reactIcon} alt="React" width={24} height={24} />,
    x: 0.5,
    y: 0.05,
    description: 'A JavaScript library for building user interfaces.'
  },
  {
    name: 'JavaScript',
    color: '#f7df1e',
    icon: <img src={javascriptIcon} alt="JavaScript" width={24} height={24} />,
    x: 0.4,
    y: 0.2,
    description: 'The language of the web.'
  },
  {
    name: 'Python',
    color: '#3776ab',
    icon: <img src={pythonIcon} alt="Python" width={24} height={24} />,
    x: 0.7,
    y: 0.1,
    description: 'A versatile programming language.'
  },
  {
    name: 'Git',
    color: 'pink',
    icon: <img src={gitIcon} alt="Git" width={24} height={24} />,
    x: 0.25,
    y: 0.3,
    description: 'Version control for code.'
  },
  {
    name: 'Java',
    color: 'orange',
    icon: <img src={javaIcon} alt="Java" width={24} height={24} />,
    x: 0.80,
    y: 0.2,
    description: 'A popular object-oriented language.'
  },
  {
    name: 'Arduino',
    color: '#F0FFF0',
    icon: <img src={arduinoIcon} alt="Arduino" width={24} height={24} />,
    x: 0.4,
    y: 0.15,
    description: 'Open-source electronics platform.'
  },
  {
    name: 'SQL Developer',
    color: '#00758F',
    icon: <img src={sqlDeveloperIcon} alt="SQL Developer" width={30} height={30} />,
    x: 0.2,
    y: 0.15,
    description: 'Database development tool.'
  },
  {
    name: 'C++',
    color: '#aa8bd0',
    icon: <img src={cplusplusIcon} alt="C++" width={24} height={24} />,
    x: 0.70,
    y: 0.25,
    description: 'A powerful systems programming language.'
  },
  {
    name: 'Next',
    color: 'pink',
    icon: <img src={nextIcon} alt="Next.js" width={24} height={24} />,
    x: 0.55,
    y: 0.20,
    description: 'React framework for production applications.'
  }
];
