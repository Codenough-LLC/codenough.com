import React, { useState } from 'react';
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators } from 'reactstrap';

import testimonials from '../data/testimonials';

const randomizeOrder = (array) =>
    array.map((element) => ({
        ...element,
        order: Math.random()
    })).sort((a, b) => a.order > b.order ? 1 : -1);

const randomTestimonials = randomizeOrder(testimonials);

const Testimonials = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const previous = () => {
        if (animating) {
            return;
        }

        const nextIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;

        setActiveIndex(nextIndex);
    };

    const next = () => {
        if (animating) {
            return;
        }

        const nextIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1;

        setActiveIndex(nextIndex);
    };

    const goToIndex = (newIndex) => {
        return !animating && setActiveIndex(newIndex);
    };

    const slides = randomTestimonials.map((testimonial, index) =>
        <CarouselItem
            onExiting={() => setAnimating(true)}
            onExited={() => setAnimating(false)}
            key={index}
        >
            <h1 style={{ fontSize: testimonial.fontSize }}><q>{testimonial.endorsement}</q></h1>
            <h2 style={{ fontSize: '3vmax' }}>{`${testimonial.clientName} (${testimonial.city}, ${testimonial.state})`}</h2>
        </CarouselItem>
    );

    return (
        <div className="testimonials-wrapper home-page-section-wrapper">
            <Carousel
                activeIndex={activeIndex}
                previous={previous}
                next={next}
                interval={10000}
            >
                <CarouselIndicators items={testimonials} activeIndex={activeIndex} onClickHandler={goToIndex} />
                {slides}
                <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
            </Carousel>
        </div>
    );
}

export default Testimonials;
