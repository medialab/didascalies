import React, { Component } from 'react';

import ReactMarkdown from 'react-markdown';


import {
  Container,
  Columns,
  Column,
  Content,
  Title,
} from 'bloomer';
export default class Apropos extends Component {

  render = () => {
    
    return (
      <Container> 
        <Columns>
          <Column isOffset={2} isSize={8}>
            <Title>
              À propos
            </Title>
            <Content>
              <ReactMarkdown source={require('raw-loader!./a-propos.md')} />
            </Content>
          </Column>
        </Columns>
      </Container>
    )
  }
}