// src/components/TestimonialsSection.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Assets Import
import community1 from '../assets/community1.jpg';
import member1 from '../assets/member1.jpg';
import community2 from '../assets/community2.jpg';
import member2 from '../assets/member2.jpg';
import community3 from '../assets/community3.webp';
import member3 from '../assets/member3.jpg';
import community4 from '../assets/community4.webp';
import member4 from '../assets/member4.jpg';

const testimonials = [
  {
    id: 1,
    image: community1,
    memberIcon: member1,
    story: 'Chama DApp transformed our savings group!',
    name: 'Halima Mwakesho',
  },
  {
    id: 2,
    image: community2,
    memberIcon: member2,
    story: 'A revolutionary platform for community growth.',
    name: 'Fatuma Binti',
  },
  {
    id: 3,
    image: community3,
    memberIcon: member3,
    story: 'It brought transparency and trust to our group.',
    name: 'Serian Kulet',
  },
  {
    id: 4,
    image: community4,
    memberIcon: member4,
    story: 'The experience has been truly empowering!',
    name: 'Mwanaisha Ali',
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 960,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const TestimonialsSection = () => {
  return (
    <Box sx={{ py: 5, backgroundColor: 'background.default' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Community Stories
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider {...sliderSettings}>
          {testimonials.map((item) => (
            <Box key={item.id} sx={{ px: 1 }}>
              <Card
                sx={{
                  minWidth: 300,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt="Community"
                />
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    {item.story}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <CardMedia
                      component="img"
                      image={item.memberIcon}
                      alt={item.name}
                      sx={{ width: 40, height: 40, borderRadius: '50%', mr: 1 }}
                    />
                    <Typography variant="subtitle2">{item.name}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
};

export default TestimonialsSection;
