import React, { Component } from 'react';

import {
  Hero,
  HeroBody,
  Container,
  Title,
} from 'bloomer';

import {getFile} from '../utils/client';


import Background from '../components/Background';

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      invectives: undefined,
      choosen: []
    }
  }
  getData = () => {
    getFile(`invectives.txt`)
    .then(str => {
        this.setState({
          invectives: str.split('\n')
        });

        setTimeout(this.updateChoosen)
      })
      .catch(console.error)
  }

  componentDidMount() {

    this.getData();
  }

  updateChoosen = () => {
    const {
      state: {
        invectives = [],
        choosen : oldChoosen
      }
    } = this;

    const choosen = [...oldChoosen];

    if (invectives.length) {
      for (let i = 0 ; i < 5 ; i++) {
        let left = 10 + Math.random() * 60;
        let top = 10 + Math.random() * 60;
        if (left > 40 && left < 60) {
          if (left < 50) {
            left -= 10;
          } else {
            left += 10;
          }
        }
        if (top > 40 && top < 70) {
          if (top < 50) {
            top -= 10;
          } else {
            top += 20;
          }
        }
        const invective = invectives[parseInt(Math.random() * invectives.length)];
        choosen.push({top, left, invective})
      }
    }
    this.setState({
      choosen
    })
  }

  render = () => {
    const {
      state: {
        invectives = [],
        choosen = []
      }
    } = this;
    
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
              {
                choosen.map(citation => {
                  
                  return (
                  <blockquote
                    style={{
                      position: 'fixed',
                      left: citation.left + '%',
                      top: citation.top + '%',
                    }}>
                    {citation.invective}
                  </blockquote>
                )})
              }
              <Title>Du Rififi à l'assemblée</Title>
          </Container>
        </HeroBody>
      </Hero>
    )
  }
}