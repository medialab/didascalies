import React, { Component } from 'react';

import {
  Hero,
  HeroBody,
  Container,
  Title
} from 'bloomer';

import Background from '../components/Background';

export default class Home extends Component {
  render = () => {
    return (
      <Hero isFullHeight isColor='info' isSize='medium'>
        <HeroBody>
          <Background />
          {/*<div
          style={{
                position: 'absolute', 
                left: 0, 
                top: 0, 
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)'
            }}
          />*/}
          <Container hasTextAlign='centered'>
          
              <Title>Du Rififi à l'assemblée</Title>
          </Container>
        </HeroBody>
      </Hero>
    )
  }
}