import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './index.scss';
import profileImg from '../../assets/images/contact_profile.jpeg';
import linkedinProfile from '../../assets/images/linkedin_profile.jpg';
import githubProfile from '../../assets/images/github_profile.jpg';
import starImg from '../../assets/images/star.png';

const SERVICE_ID = 'service_0lpg5co';
const TEMPLATE_ID = 'template_gja4k87';
const PUBLIC_KEY = 'G_XboOljkeTkIZSl5';

const linkedinIcon = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="contact-icon-svg">
    <rect width="32" height="32" rx="8" fill="#0A66C2"/>
    <path d="M10.6667 13.3333H13.3333V22.6667H10.6667V13.3333ZM12 10.6667C12.7364 10.6667 13.3333 11.2636 13.3333 12C13.3333 12.7364 12.7364 13.3333 12 13.3333C11.2636 13.3333 10.6667 12.7364 10.6667 12C10.6667 11.2636 11.2636 10.6667 12 10.6667ZM15.3333 13.3333H18V14.6667H18.04C18.4267 13.96 19.24 13.2533 20.3333 13.2533C22.3333 13.2533 22.6667 14.52 22.6667 16.08V22.6667H20V16.6667C20 15.8133 20 14.6667 18.6667 14.6667C17.3333 14.6667 17.3333 15.8133 17.3333 16.6667V22.6667H15.3333V13.3333Z" fill="white"/>
  </svg>
);

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const formRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError(false);
    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(() => {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 4000);
      })
      .catch(() => {
        setError(true);
        setTimeout(() => setError(false), 4000);
      });
  };

  return (
    <div className="contact-main-flex">
      <img src={starImg} alt="star" className="contact-star-img" />
      <div className="contact-left">
        <img src={profileImg} alt="Esther Thompson" className="contact-profile-img" />
      </div>
      <div className="contact-right">
        <h1 className="contact-title">Work with me</h1>
        <div className="contact-info-block">
          <div className="contact-info-label">LINKEDIN</div>
          <a className="contact-info-link contact-icon-link" href="https://www.linkedin.com/in/esther-thompson-2436911b4/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinProfile} alt="LinkedIn profile" className="contact-icon-img" />
            <b>https://www.linkedin.com/in/esther-thompson-2436911b4/</b>
          </a>
        </div>
        <div className="contact-info-block">
          <div className="contact-info-label">GITHUB</div>
          <div className="contact-github-card">
            <a href="https://github.com/estherthompson" target="_blank" rel="noopener noreferrer" className="contact-github-avatar-link">
              <img src={githubProfile} alt="GitHub profile" className="contact-github-avatar" />
            </a>
            <div>
              <div className="contact-github-title">estherthompson - Repositories</div>
              <div className="contact-github-desc">estherthompson has 10 repositories available. Follow their code on GitHub.</div>
              <a className="contact-info-link contact-icon-link" href="https://github.com/estherthompson" target="_blank" rel="noopener noreferrer">
                <b>https://github.com/estherthompson</b>
              </a>
            </div>
          </div>
        </div>
        <div className="contact-info-block">
          <div className="contact-info-label">EMAIL</div>
          <div className="contact-info-email"><b>estherthompson879@gmail.com</b></div>
        </div>
        <div className="contact-form-wrapper">
          <form className="contact-form" ref={formRef} onSubmit={handleSubmit} autoComplete="off">
            <label>
              Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Message
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} />
            </label>
            <button type="submit">Send</button>
            {submitted && <div className="contact-success">Thank you! Your message has been sent.</div>}
            {error && <div className="contact-error">Sorry, something went wrong. Please try again.</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;