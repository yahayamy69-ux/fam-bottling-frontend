import React from 'react';
import Card from '../components/Card';
import '../styles/MeetFounders.css';

const MeetFounders = () => {
  const founders = [
    {
      name: 'Engr Adam Muhammad',
      image: '/images/1.jpeg',
      title: 'Founder & CEO'
    },
    {
      name: 'Engr Fatima Umar-Sadiq',
      image: '/images/fatima replacement picture.jpeg',
      title: 'Co-Founder & Operations Lead'
    },
    {
      name: 'Engr Yahaya Muhammad',
      image: '/images/3.jpeg',
      title: 'Co-Founder & Technical Lead'
    }
  ];

  return (
    <div className="meet-founders-page">
      <div className="founders-header">
        <h1>Meet the Founders</h1>
        <p className="header-subtitle">The passionate team behind FAM Bottling Co</p>
      </div>

      <div className="founders-container">
        <div className="founders-grid">
          {founders.map((founder, index) => (
            <Card key={index} className="founder-card">
              <div className="founder-image">
                <img src={founder.image} alt={founder.name} />
              </div>
              <div className="founder-info">
                <h3>{founder.name}</h3>
                <p className="founder-title">{founder.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <section className="founders-story">
        <Card className="story-card">
          <h2>Our Story</h2>
          <p>
            FAM Bottling Co was founded by a team of experienced engineers with a shared vision:
            to revolutionize the bottle supply and cashback management industry. With years of
            experience in manufacturing and logistics, our founders embarked on a mission to create
            a transparent, efficient, and rewarding platform for businesses.
          </p>
          <p>
            Today, FAM Bottling Co stands as a testament to their commitment to excellence,
            sustainability, and customer satisfaction.
          </p>
        </Card>
      </section>
    </div>
  );
};

export default MeetFounders;
