import React, { Component } from 'react';

import {
  Hero,
  HeroBody,
  Container,
  Title
} from 'bloomer';

export default class Home extends Component {
  render = () => {
    return (
      <Hero isFullHeight isColor='info' isSize='medium'>
        <HeroBody>
            <Container hasTextAlign='centered'>
                <Title>Du Rififi à l'assemblée</Title>
            </Container>
        </HeroBody>
      </Hero>
    )
  }
}