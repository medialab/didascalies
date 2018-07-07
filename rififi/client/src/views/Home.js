import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import {Link} from 'react-router-dom';

import {
  Button,
  Hero,
  HeroBody,
  Container,
  Title,
  Content
} from 'bloomer';

import {getFile} from '../utils/client';

const NB_ROWS = 3;
const NB_LINES = 4;
const NB_QUOTES = 4;
const UPDATE_TIMEOUT = 5000;


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
        // choosen : oldChoosen
      }
    } = this;

    const choosen = [];

    let cells = [];
    for (let i = 0 ; i < NB_LINES ; i++) {
      const line = [];
      for (let j = 0 ; j < NB_ROWS ; j++)
        line.push(j);
      cells.push(line);
    }

    if (invectives.length) {
      for (let i = 0 ; i < NB_QUOTES ; i++) {
        let coords;
        let lineI;
        do {
          lineI = parseInt(Math.random() * cells.length);
          if (cells[lineI].length)
            continue;
        } while (cells.length && cells[lineI].length === 0);
        let line = cells[lineI];

        let rowI;
        do {
          rowI = parseInt(Math.random() * line.length);
        } while (choosen.find(c => c.lineI === lineI && c.rowI === rowI) !== undefined);
        
        let row = line[rowI];

        const already = choosen.find(c => c.lineI === lineI && c.rowI === rowI);
        if (already) console.log('oupsy', rowI, lineI,);

        cells[lineI].splice(rowI, 1);

        const inTop = i > NB_QUOTES/2;

        const yDisplace = inTop ? 10 : 70;

        let left = row * (90/NB_ROWS);
        let top = lineI * (20/NB_LINES) + yDisplace;
        

        const invective = invectives[parseInt(Math.random() * invectives.length)];
        choosen.push({top, lineI, rowI, left, invective})
      }
    }
    this.setState({
      choosen
    });
    setTimeout(() => {
      this.setState({
        choosen: []
      });
      setTimeout(this.updateChoosen, UPDATE_TIMEOUT/2)
    }, UPDATE_TIMEOUT/2)
  }

  render = () => {
    const {
      state: {
        invectives = [],
        choosen = []
      }
    } = this;
    
    return (
      <Hero isFullHeight isColor='info' isSize='medium' style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}>
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
              <ReactCSSTransitionGroup
                transitionName="quote"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>

              {
                choosen.map((citation, index) => {
                  return (
                  <blockquote
                    key={index}
                    className="citation"
                    style={{
                      position: 'fixed',
                      left: citation.left + '%',
                      top: citation.top + '%',
                      width: (90/NB_ROWS) + '%'

                    }}>
                    {citation.invective}
                  </blockquote>
                )})
              }
              </ReactCSSTransitionGroup>
              <div style={{background: 'rgba(0,0,0,0.05)', padding: '3rem'}}>
                <Title className="big-title">Du Rififi à l'assemblée</Title>
                <Content>
                  Une exploration des compte-rendus de séances de la XV<sup>ème</sup> législature.
                </Content>

                <div>
                  <Button isColor="primary">
                    <Link to={'/liste'}>
                      Commencer
                    </Link>
                  </Button>
                </div>
              </div>
          </Container>
        </HeroBody>
      </Hero>
    )
  }
}